import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { AvatarBinary } from "#src/services/genshinAssets/avatar/writeAvatarBinary";
import type { AvatarMesh, AvatarSubmesh } from "genshin-world/sceneExport";

// The export's mesh in three's axes and in the binary's arrays. The axes mirror across x as the exports do, so a
// Triangle's winding turns the other way, and each one is written with its last two indices swapped to keep its face
// Toward the viewer. A tangent's w turns with the mirror too. A vertex's joints index the rig: `nodeOfMeshBone` gives the
// Rig node of each of the mesh's own bones, and `rootBone` the rig node of the renderer's root bone
export const buildAvatarMesh = (
  name: string,
  mesh: DumpedMesh,
  nodeOfMeshBone: readonly number[],
  submeshMaterials: readonly string[],
  rootBone: number,
  binary: AvatarBinary,
): AvatarMesh => {
  const vertexCount = mesh.m_VertexCount;
  const positions = mirrorXyz(mesh.m_Vertices, 3);
  const normals = mirrorXyz(mesh.m_Normals, 3);
  // A mesh the dump gives no tangents, as the effect mesh is, carries zeros: the avatar's shading reads no normal map
  const tangents = mesh.m_Tangents ? mirrorXyz(mesh.m_Tangents, 4) : new Float32Array(vertexCount * 4);
  const joints = new Uint16Array(vertexCount * 4);
  const weights = new Float32Array(vertexCount * 4);
  for (const [vertex, { boneIndex, weight }] of mesh.m_Skin.entries())
    for (let slot = 0; slot < 4; slot++) {
      joints[vertex * 4 + slot] = nodeOfMeshBone[boneIndex[slot] ?? 0] ?? 0;
      weights[vertex * 4 + slot] = weight[slot] ?? 0;
    }
  const indices = mesh.m_Indices;
  const flipped = vertexCount > UINT16_LIMIT ? new Uint32Array(indices.length) : new Uint16Array(indices.length);
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    flipped[triangle] = indices[triangle] ?? 0;
    flipped[triangle + 1] = indices[triangle + 2] ?? 0;
    flipped[triangle + 2] = indices[triangle + 1] ?? 0;
  }
  let start = 0;
  const submeshes: AvatarSubmesh[] = mesh.m_SubMeshes.map(({ indexCount }, index) => {
    const submesh = { count: indexCount, material: submeshMaterials[index] ?? "", start };
    start += indexCount;
    return submesh;
  });
  return {
    colors: binary.add(new Float32Array(mesh.m_Colors)),
    indices: { ...binary.add(flipped), isUint32: flipped instanceof Uint32Array },
    joints: binary.add(joints),
    name,
    normals: binary.add(normals),
    positions: binary.add(positions),
    rootBone,
    submeshes,
    tangents: binary.add(tangents),
    uvs: binary.add(new Float32Array(mesh.m_UV0)),
    weights: binary.add(weights),
  };
};

const UINT16_LIMIT = 65_535;

// Each point's x negated, its w too when it has one: a tangent's handedness turns with any mirror
const mirrorXyz = (values: readonly number[], stride: number): Float32Array => {
  const mirrored = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += stride) {
    mirrored[index] = -(values[index] ?? 0);
    mirrored[index + 1] = values[index + 1] ?? 0;
    mirrored[index + 2] = values[index + 2] ?? 0;
    if (stride === 4) mirrored[index + 3] = -(values[index + 3] ?? 0);
  }
  return mirrored;
};
