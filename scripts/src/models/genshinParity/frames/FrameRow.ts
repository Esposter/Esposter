import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// One frame of a clip read over a rectangle: its index and the second it is shown at, the rectangle's mean colour, its
// Ink summed over every pixel, and the box that ink fills in the rectangle's own pixels, absent when no step stands out
export interface FrameRow {
  box?: ImageRegion;
  index: number;
  ink: number;
  mean: [number, number, number];
  seconds: number;
}
