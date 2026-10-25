import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { computeVertexNormals } from "#src/services/genshinAssets/fit/computeVertexNormals";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { Quaternion, Vector3 } from "three";

// A mesh's faces, vertices and vertex normals in three's axes, placed where its placement stands it and taken round the
// Oak's foot, the origin's place in the game's axes, so every point it yields is placed as every other fit's are, with
// Its faces' texture coordinates as the file holds them
export const readMeshInThree = async (
  path: string,
  placement: AssetPlacement,
  origin: readonly [number, number, number],
): Promise<
  Pick<Awaited<ReturnType<typeof readObjMesh>>, "faceGroups" | "faces" | "faceUvs" | "uvs"> & {
    normals: (undefined | Vector)[];
    vertices: Vector[];
  }
> => {
  const mesh = await readObjMesh(path);
  const [originX, originY, originZ] = origin;
  const rotation = new Quaternion(...placement.rotation);
  const normal = new Vector3();
  return {
    faceGroups: mesh.faceGroups,
    faces: mesh.faces,
    faceUvs: mesh.faceUvs,
    normals: computeVertexNormals(mesh).map((vertexNormal) => {
      if (!vertexNormal) return undefined;
      normal.set(...vertexNormal).applyQuaternion(rotation);
      return toRightHanded(normal.toArray());
    }),
    uvs: mesh.uvs,
    vertices: toWorldVertices(mesh.vertices, placement).map(([x, y, z]) =>
      toRightHanded([x - originX, y - originY, z - originZ]),
    ),
  };
};
