import type { GroundPoint } from "genshin-engine";

// The square a piece of an area is fitted over: its outline's bounding box round the box's centre, as wide as the box's
// Longer side
export const getGroundPieceSquare = (outline: readonly GroundPoint[]): { centre: GroundPoint; half: number } => {
  const xs = outline.map(({ x }) => x);
  const zs = outline.map(({ z }) => z);
  return {
    centre: { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 },
    half: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) / 2,
  };
};
