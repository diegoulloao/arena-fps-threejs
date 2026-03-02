export type MovementBounds = [number, number];

export interface PlayerProps {
  yStartPoint?: number;
  movementBounds?: MovementBounds;
}

export type PlayerPosition = [number, number, number];
export type PlayerVelocity = [number, number, number];

export interface MovementLimits {
  xLimit: number;
  zLimit: number;
}

export interface HorizontalVelocity {
  x: number;
  z: number;
}

export interface PlayerMovementState {
  moveForward: boolean;
  moveBackguard: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
}
