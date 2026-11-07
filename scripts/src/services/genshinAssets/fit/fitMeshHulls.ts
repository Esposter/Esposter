import { fitVisualHull } from "#src/services/genshinAssets/fit/fitVisualHull";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { HULL_CELL_SIZE, HULL_MESH_READ_CONCURRENCY } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { settleAll } from "@esposter/shared";

// The visual hull of each mesh, fitted off its own export in three's axes as boxes at `HULL_CELL_SIZE`, keyed by the name
// Its mesh is given in the map
export const fitMeshHulls = async (meshPaths: ReadonlyMap<string, string>): Promise<Record<string, number[][]>> =>
  Object.fromEntries(
    await settleAll(
      Array.from(meshPaths, ([name, meshPath]) => async () => {
        const { faces, vertices } = await readObjMesh(meshPath);
        const local = vertices.map((vertex) => toRightHanded(vertex));
        return [
          name,
          fitVisualHull({ faces, vertices: local }, HULL_CELL_SIZE).map((box) =>
            box.map((value) => roundFitted(value)),
          ),
        ] as const;
      }),
      HULL_MESH_READ_CONCURRENCY,
    ),
  );
