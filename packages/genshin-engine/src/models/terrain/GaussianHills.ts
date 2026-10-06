import type { GaussianHill } from "#src/models/terrain/GaussianHill";

// A ground drawn as Gaussian hills over a base height
export interface GaussianHills {
  base: number;
  hills: GaussianHill[];
}
