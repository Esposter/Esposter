import type { Vector } from "#src/models/shared/Vector";

// The colour a family paints its part with: its linear mean, the spread of the cluster it is the mean of, and how many
// Texels the cluster holds
export interface DominantColour {
  linear: Vector;
  spread: number;
  texelCount: number;
}
