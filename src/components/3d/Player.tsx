// React
import { useEffect, useMemo, useRef } from "react";

// Hooks
import { usePlayerMovements } from "./hooks";

// Three.js
import { useThree, useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { Euler, Vector3 } from "three";

// Interfaces
interface PlayerProps {
  yStartPoint?: number;
  movementBounds?: [number, number];
}

type PlayerPosition = [number, number, number];
type PlayerVelocity = [number, number, number];

interface MovementLimits {
  xLimit: number;
  zLimit: number;
}

interface HorizontalVelocity {
  x: number;
  z: number;
}

// Constants
const PLAYER_WALK_SPEED = 7;
const PLAYER_RADIUS = 1;
const POSITION_EPSILON = 0.001;
const DEFAULT_Y_START_POINT = 3;
const DEFAULT_MOVEMENT_BOUNDS: [number, number] = [30, 30];

/**
 * Component: Player
 * Player component representing the player character in the 3D scene. It handles player movement, physics, and camera synchronization.
 */
const Player: React.FC<PlayerProps> = ({
  yStartPoint = DEFAULT_Y_START_POINT,
  movementBounds = DEFAULT_MOVEMENT_BOUNDS,
}) => {
  // Values
  const positionRef = useRef<PlayerPosition>([0, 0, 0]);
  const velocityRef = useRef<PlayerVelocity>([0, 0, 0]);

  const movementLimits = useMemo(
    () => getMovementLimits(movementBounds, PLAYER_RADIUS),
    [movementBounds],
  );

  // Hooks
  const movements = usePlayerMovements();

  // Camera for player perspective
  const { camera } = useThree();

  // Player
  const [ref, api] = useSphere(() => ({
    args: [PLAYER_RADIUS],
    mass: 1,
    type: "Dynamic",
    position: [0, yStartPoint, 0],
  }));

  // Link camera with player position
  useFrame(() => {
    const { nextPosition, didClamp } = clampPositionToBounds(
      positionRef.current,
      movementLimits,
    );

    if (didClamp) {
      api.position.set(...nextPosition);
      positionRef.current = nextPosition;
    }

    camera.position.set(...positionRef.current);

    const direction = getMovementDirection(movements, camera.rotation);
    const horizontalVelocity = limitHorizontalVelocityAtBounds(
      direction,
      positionRef.current,
      movementLimits,
    );

    api.velocity.set(
      horizontalVelocity.x,
      velocityRef.current[1],
      horizontalVelocity.z,
    );
  });

  // Subscribe to player position changes
  useEffect(() => {
    const unsubscribe = api.position.subscribe((currentPosition) => {
      positionRef.current = currentPosition;
    });

    return unsubscribe;
  }, [api.position]);

  // Subscribe to player velocity changes
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((currentVelocity) => {
      velocityRef.current = currentVelocity;
    });

    return unsubscribe;
  }, [api.velocity]);

  return <mesh ref={ref as MeshGeometryRef} />;
};

export { Player };

/**
 * Clamps a value between a minimum and maximum range.
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculates the movement limits for the player based on the ground dimensions and player radius.
 */
const getMovementLimits = (
  movementBounds: [number, number],
  playerRadius: number,
): MovementLimits => {
  const [groundWidth, groundDepth] = movementBounds;

  return {
    xLimit: groundWidth / 2 - playerRadius,
    zLimit: groundDepth / 2 - playerRadius,
  };
};

/**
 * Clamps the player's position within the defined movement bounds. Returns the clamped position and a flag indicating if clamping occurred.
 */
const clampPositionToBounds = (
  position: PlayerPosition,
  { xLimit, zLimit }: MovementLimits,
): { nextPosition: PlayerPosition; didClamp: boolean } => {
  const [x, y, z] = position;
  const clampedX = clamp(x, -xLimit, xLimit);
  const clampedZ = clamp(z, -zLimit, zLimit);
  const didClamp = clampedX !== x || clampedZ !== z;

  return {
    nextPosition: [clampedX, y, clampedZ],
    didClamp,
  };
};

/**
 * Calculates the movement direction based on player inputs and camera rotation. Returns a normalized vector representing the movement direction.
 */
const getMovementDirection = (
  movements: ReturnType<typeof usePlayerMovements>,
  cameraRotation: Euler,
): Vector3 => {
  const { moveForward, moveBackguard, moveLeft, moveRight } = movements;
  const frontVector = new Vector3(0, 0, +moveBackguard - +moveForward);
  const sideVector = new Vector3(+moveLeft - +moveRight, 0, 0);

  return new Vector3()
    .subVectors(frontVector, sideVector)
    .normalize()
    .multiplyScalar(PLAYER_WALK_SPEED)
    .applyEuler(cameraRotation);
};

/**
 * Limits the player's horizontal velocity when they are at the movement bounds.
 * If the player is trying to move further out of bounds, their velocity in that direction is set to zero.
 */
const limitHorizontalVelocityAtBounds = (
  direction: Vector3,
  [currentX, , currentZ]: PlayerPosition,
  { xLimit, zLimit }: MovementLimits,
): HorizontalVelocity => {
  const isAtMinX = currentX <= -xLimit + POSITION_EPSILON;
  const isAtMaxX = currentX >= xLimit - POSITION_EPSILON;
  const isAtMinZ = currentZ <= -zLimit + POSITION_EPSILON;
  const isAtMaxZ = currentZ >= zLimit - POSITION_EPSILON;

  let velocityX = direction.x;
  let velocityZ = direction.z;

  if ((isAtMinX && velocityX < 0) || (isAtMaxX && velocityX > 0)) {
    velocityX = 0;
  }

  if ((isAtMinZ && velocityZ < 0) || (isAtMaxZ && velocityZ > 0)) {
    velocityZ = 0;
  }

  return {
    x: velocityX,
    z: velocityZ,
  };
};
