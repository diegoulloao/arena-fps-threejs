import { Euler, Vector3 } from "three";
import {
  AIR_CONTROL_BLEND_FACTOR,
  AIR_MOMENTUM_THRESHOLD,
  AIR_MOVEMENT_FACTOR,
  AIR_SPEED_EPSILON,
  GROUND_CHECK_EPSILON,
  GROUND_HEIGHT,
  JUMP_VELOCITY_EPSILON,
  PLAYER_RADIUS,
  PLAYER_WALK_SPEED,
  POSITION_EPSILON,
} from "./constants";

import type {
  HorizontalVelocity,
  MovementBounds,
  MovementLimits,
  PlayerMovementState,
  PlayerPosition,
} from "./types";

/*
  Clamps a numeric value within an inclusive min/max range.
*/
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/*
  Computes horizontal movement limits from ground size and player radius.
*/
export const getMovementLimits = (
  movementBounds: MovementBounds,
  playerRadius: number,
): MovementLimits => {
  const [groundWidth, groundDepth] = movementBounds;

  return {
    xLimit: groundWidth / 2 - playerRadius,
    zLimit: groundDepth / 2 - playerRadius,
  };
};

/*
  Ensures the player position stays inside movement bounds and reports if clamping happened.
*/
export const clampPositionToBounds = (
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

/*
  Builds a world-space movement direction from input state and camera rotation.
*/
export const getMovementDirection = (
  movements: PlayerMovementState,
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

/*
  Blocks horizontal velocity components that would move the player outside map bounds.
*/
export const limitHorizontalVelocityAtBounds = (
  horizontalVelocity: HorizontalVelocity,
  [currentX, , currentZ]: PlayerPosition,
  { xLimit, zLimit }: MovementLimits,
): HorizontalVelocity => {
  const isAtMinX = currentX <= -xLimit + POSITION_EPSILON;
  const isAtMaxX = currentX >= xLimit - POSITION_EPSILON;
  const isAtMinZ = currentZ <= -zLimit + POSITION_EPSILON;
  const isAtMaxZ = currentZ >= zLimit - POSITION_EPSILON;

  let velocityX = horizontalVelocity.x;
  let velocityZ = horizontalVelocity.z;

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

/*
  Returns true when the player's feet are touching the ground threshold.
*/
export const isPlayerGrounded = ([, positionY]: PlayerPosition): boolean => {
  const feetY = positionY - PLAYER_RADIUS;

  return feetY <= GROUND_HEIGHT + GROUND_CHECK_EPSILON;
};

/*
  Reduces horizontal movement while in air to emulate lower air control.
*/
export const applyAirMovementFactor = (
  desiredHorizontalVelocity: HorizontalVelocity,
  currentHorizontalVelocity: HorizontalVelocity,
  isGrounded: boolean,
): HorizontalVelocity => {
  if (isGrounded) {
    return desiredHorizontalVelocity;
  }

  const currentHorizontalSpeed = Math.hypot(
    currentHorizontalVelocity.x,
    currentHorizontalVelocity.z,
  );
  const hasMomentum = currentHorizontalSpeed >= AIR_MOMENTUM_THRESHOLD;

  if (!hasMomentum) {
    return {
      x: desiredHorizontalVelocity.x * AIR_MOVEMENT_FACTOR,
      z: desiredHorizontalVelocity.z * AIR_MOVEMENT_FACTOR,
    };
  }

  const desiredHorizontalSpeed = Math.hypot(
    desiredHorizontalVelocity.x,
    desiredHorizontalVelocity.z,
  );

  if (desiredHorizontalSpeed <= AIR_SPEED_EPSILON) {
    return currentHorizontalVelocity;
  }

  return {
    x:
      currentHorizontalVelocity.x +
      (desiredHorizontalVelocity.x - currentHorizontalVelocity.x) *
        AIR_CONTROL_BLEND_FACTOR,
    z:
      currentHorizontalVelocity.z +
      (desiredHorizontalVelocity.z - currentHorizontalVelocity.z) *
        AIR_CONTROL_BLEND_FACTOR,
  };
};

/*
  Returns true when the player is grounded and not already moving upward.
*/
export const canPlayerJump = (
  position: PlayerPosition,
  currentVerticalVelocity: number,
): boolean => {
  const isGrounded = isPlayerGrounded(position);
  const isNotMovingUp = currentVerticalVelocity <= JUMP_VELOCITY_EPSILON;

  return isGrounded && isNotMovingUp;
};
