// The texels a face's UV triangle covers per point it is read at: a face of a small footprint is read at its centroid, and
// A large one (a leaf card's, its texels mostly transparent) at a lattice of points spread over it, so the opaque texels
// It covers all count
const SURFACE_SAMPLE_TEXELS = 64;
// The most points a face is read at, on a lattice this many points a side
const MAX_LATTICE_SIDE = 8;

// The points a face's UV triangle is read at: on a triangular lattice of cells inside it, each point at its cell's
// Centre, so every point stands inside the triangle and the points share its area evenly. The lattice's side is set by
// How many texels the triangle covers in a texture of the given size
export const sampleFaceUvs = (
  [first, second, third]: readonly [readonly [number, number], readonly [number, number], readonly [number, number]],
  { height, width }: { height: number; width: number },
): [number, number][] => {
  const texels =
    (Math.abs((second[0] - first[0]) * (third[1] - first[1]) - (third[0] - first[0]) * (second[1] - first[1])) / 2) *
    width *
    height;
  const side = Math.min(MAX_LATTICE_SIDE, Math.max(1, Math.ceil(Math.sqrt((2 * texels) / SURFACE_SAMPLE_TEXELS))));
  return Array.from({ length: side }, (_row, row) =>
    Array.from({ length: side - row }, (_column, column): [number, number] => {
      const [u, v] = [(row + 1 / 3) / side, (column + 1 / 3) / side];
      return [
        first[0] + u * (second[0] - first[0]) + v * (third[0] - first[0]),
        first[1] + u * (second[1] - first[1]) + v * (third[1] - first[1]),
      ];
    }),
  ).flat();
};
