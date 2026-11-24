// A place that gives off heat, at a point of the catalogue's frame, and whether it is lit: a campfire, which the
// Cooking rules light and put out
export interface HeatSource {
  isLit: boolean;
  x: number;
  z: number;
}
