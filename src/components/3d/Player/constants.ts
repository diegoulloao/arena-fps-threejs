import type { MovementBounds } from "./types";

export const PLAYER_WALK_SPEED = 7;
export const PLAYER_RADIUS = 1;
export const POSITION_EPSILON = 0.001;
export const AIR_MOVEMENT_FACTOR = 0.4;
export const JUMP_FORCE = 8;
export const GROUND_HEIGHT = -0.5;
export const GROUND_CHECK_EPSILON = 0.05;
export const JUMP_VELOCITY_EPSILON = 0.1;
export const DEFAULT_Y_START_POINT = 3;
export const DEFAULT_MOVEMENT_BOUNDS: MovementBounds = [30, 30];
