import type { MeshBounds } from "#src/models/genshinAssets/bounds/MeshBounds";

import { computeMeshBounds } from "#src/services/genshinAssets/bounds/computeMeshBounds";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";

// A mesh's bounds read from its exported OBJ, with the OBJ reader the fits share, so they are in the game's own axes
export const readMeshBounds = async (path: string): Promise<MeshBounds> =>
  computeMeshBounds((await readObjMesh(path)).vertices);
