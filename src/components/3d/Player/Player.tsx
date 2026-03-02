import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";

import { usePlayerMovements } from "../hooks";
import {
  DEFAULT_MOVEMENT_BOUNDS,
  DEFAULT_Y_START_POINT,
  JUMP_FORCE,
  PLAYER_RADIUS,
} from "./constants";
import {
  canPlayerJump,
  clampPositionToBounds,
  getMovementDirection,
  getMovementLimits,
  limitHorizontalVelocityAtBounds,
} from "./helpers";
import type { PlayerPosition, PlayerProps, PlayerVelocity } from "./types";

const Player: React.FC<PlayerProps> = ({
  yStartPoint = DEFAULT_Y_START_POINT,
  movementBounds = DEFAULT_MOVEMENT_BOUNDS,
}) => {
  const positionRef = useRef<PlayerPosition>([0, 0, 0]);
  const velocityRef = useRef<PlayerVelocity>([0, 0, 0]);
  const jumpLatchRef = useRef(false);

  const movementLimits = useMemo(
    () => getMovementLimits(movementBounds, PLAYER_RADIUS),
    [movementBounds],
  );

  const movements = usePlayerMovements();
  const { camera } = useThree();

  const [ref, api] = useSphere(() => ({
    args: [PLAYER_RADIUS],
    mass: 1,
    type: "Dynamic",
    position: [0, yStartPoint, 0],
  }));

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

    const currentVerticalVelocity = velocityRef.current[1];
    let nextVerticalVelocity = currentVerticalVelocity;

    if (movements.jump && !jumpLatchRef.current) {
      if (canPlayerJump(positionRef.current, currentVerticalVelocity)) {
        nextVerticalVelocity = JUMP_FORCE;
        jumpLatchRef.current = true;
      }
    }

    if (!movements.jump) {
      jumpLatchRef.current = false;
    }

    api.velocity.set(
      horizontalVelocity.x,
      nextVerticalVelocity,
      horizontalVelocity.z,
    );
  });

  useEffect(() => {
    const unsubscribe = api.position.subscribe((currentPosition) => {
      positionRef.current = currentPosition;
    });

    return unsubscribe;
  }, [api.position]);

  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((currentVelocity) => {
      velocityRef.current = currentVelocity;
    });

    return unsubscribe;
  }, [api.velocity]);

  return <mesh ref={ref as MeshGeometryRef} />;
};

export { Player };
