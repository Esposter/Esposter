import type { Vector3 } from "three";

// The game's outline offset, as its vertex program moves a vertex: along the ray from the eye through the vertex, by the
// Size scaled by the vertex's blue less a half where the block-B flag is below a half, and by one where it is not. Its
// Form is the program's, Exact; a flag of zero with a blue of a half, as every face vertex has, offsets nothing. This is the
// Reference for the rule: the outline pass's TSL offset node is its GPU form, and a change to the rule lands in both
export const getGameOutlineOffset = (
  viewPosition: Vector3,
  blue: number,
  blockBChannel: number,
  size: number,
): Vector3 => {
  const scale = blockBChannel < 0.5 ? blue - 0.5 : 1;
  return viewPosition
    .clone()
    .normalize()
    .multiplyScalar(size * scale);
};
