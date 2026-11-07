import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readWitnessLayout } from "#src/services/genshinAssets/fit/readWitnessLayout";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { join } from "node:path";
import { Vector3 } from "three";

// The world's vertices of each placement in a component's witness whose mesh is kept, one list a placement. Each mesh's
// Vertices are turned into three's axes before its placement carries them, since the witness lays its placements out
// In three's axes round the origin already
export const readWitnessWorldMeshes = async (
  component: DerivedAssetComponent,
  checkIsKept: (mesh: string) => boolean,
): Promise<Vector3[][]> => {
  const { assets } = getComponentDirectory(component);
  const { placements } = await readWitnessLayout(component);
  return Promise.all(
    placements
      .filter(({ mesh }) => checkIsKept(mesh))
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
