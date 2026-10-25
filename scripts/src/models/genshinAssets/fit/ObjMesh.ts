import type { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";

export type ObjMesh = Awaited<ReturnType<typeof readObjMesh>>;
