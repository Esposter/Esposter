import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { Matrix4, Quaternion, Vector3 } from "three";

// A mesh's vertices where one placement of it stands, in the game's own axes
export const toWorldVertices = (
  vertices: readonly (readonly [number, number, number])[],
  { position, rotation, scale }: Pick<AssetPlacement, "position" | "rotation" | "scale">,
): [number, number, number][] => {
  const matrix = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
  const vertex = new Vector3();
  return vertices.map(([x, y, z]) => vertex.set(x, y, z).applyMatrix4(matrix).toArray());
};
