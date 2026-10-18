import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Vector3 } from "three";

// The world's vertices of each placement in a component's witness whose mesh is kept, one list a placement. Each mesh's
// Vertices are turned into three's axes before its placement carries them, since the witness lays its placements out
// In three's axes round the origin already
export const readWitnessWorldMeshes = async (
  component: DerivedAssetComponent,
  isKept: (mesh: string) => boolean,
): Promise<Vector3[][]> => {
  const { assets, root } = getComponentDirectory(component);
  const layout = parseMachineJson<SceneLayout>(await readFile(join(root, WITNESS_LAYOUT_FILE_NAME), "utf8"));
  return Promise.all(
    layout.placements
      .filter(({ mesh }) => isKept(mesh))
      .map(async (placement) => {
        const { vertices } = await readObjMesh(join(assets, AssetType.Mesh, `${placement.mesh}.obj`));
        const world = toWorldVertices(
          vertices.map((vertex) => toRightHanded(vertex)),
          placement,
        );
        return world.map((vertex) => new Vector3(...vertex));
      }),
  );
};
