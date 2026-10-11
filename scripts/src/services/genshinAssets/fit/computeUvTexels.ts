// The texels a face's UV triangle covers in a texture of the given size
export const computeUvTexels = (
  [first, second, third]: readonly [readonly [number, number], readonly [number, number], readonly [number, number]],
  { height, width }: { height: number; width: number },
): number =>
  (Math.abs((second[0] - first[0]) * (third[1] - first[1]) - (third[0] - first[0]) * (second[1] - first[1])) / 2) *
  width *
  height;
