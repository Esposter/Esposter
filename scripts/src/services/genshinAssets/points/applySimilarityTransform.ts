import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

// A point carried by a similarity: mirrored across the x axis if the transform says so, then turned and scaled about
// The origin as one complex factor, then offset
export const applySimilarityTransform = (
  { mirrored, offset, scale, turn }: SimilarityTransform,
  point: GroundPoint,
): GroundPoint => {
  const z = mirrored ? -point.z : point.z;
  const cos = Math.cos(turn) * scale;
  const sin = Math.sin(turn) * scale;
  return { x: cos * point.x - sin * z + offset.x, z: sin * point.x + cos * z + offset.z };
};
