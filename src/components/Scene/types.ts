export type GroundSize = [number, number];
export type WorldGravity = [number, number, number];

export interface SkyProps {
  distance: number;
  sunPosition: [number, number, number];
  inclination: number;
  rayleigh: number;
  azimuth: number;
  mieDirectionalG: number;
  mieCoefficient: number;
  turbidity: number;
}
