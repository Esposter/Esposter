export interface SilhouetteOptions {
  // Every loop round the shape in x and y: an outer ring counterclockwise and a hole in it clockwise
  contours: [number, number][][];
  // Where the slab starts and ends along z
  depth: [number, number];
}
