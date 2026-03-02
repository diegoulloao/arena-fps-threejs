import type { GroundSize, SkyProps, WorldGravity } from "./types";

export const GROUND_SIZE: GroundSize = [30, 30];
export const WORLD_GRAVITY: WorldGravity = [0, -23, 0];
export const PLAYER_START_Y = 3;
export const AMBIENT_LIGHT_INTENSITY = 0.7;

export const SKY_PROPS: SkyProps = {
  distance: 450000,
  sunPosition: [100000, 0, 0],
  inclination: 0,
  rayleigh: 4,
  azimuth: 180,
  mieDirectionalG: 0.9,
  mieCoefficient: 0.02,
  turbidity: 20,
};
