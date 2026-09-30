import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The door's object and the mesh it draws share this name
const DOOR_MESH = "LoginScene_Door01_Vo";
// The door where the scene stands it, and its size there: the foot of its middle, and its width, height and depth
export const fitLoginDoor = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ position: [number, number, number]; size: [number, number, number] }> => {
  const placement = placements.find(({ name }) => name === DOOR_MESH);
  if (!placement) throw new InvalidOperationError(Operation.Read, DOOR_MESH, "not placed in the login scene");
  const { vertices } = await readObjMesh(join(meshDirectory, `${DOOR_MESH}.obj`));
  const [scale] = placement.scale;
  const extent = (axis: 0 | 1 | 2): number =>
    (Math.max(...vertices.map((vertex) => vertex[axis])) - Math.min(...vertices.map((vertex) => vertex[axis]))) * scale;
  const [x = 0, y = 0, z = 0] = toRightHanded(placement.position).map((value) => roundFitted(value));
  return { position: [x, y, z], size: [roundFitted(extent(0)), roundFitted(extent(1)), roundFitted(extent(2))] };
};
