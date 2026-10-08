import type { PmxModel } from "#src/models/character/PmxModel";
import type { BufferGeometry, Material } from "three";

import { PMX_UNIT_METRES } from "#src/character/constants";
import { createPmxGeometry } from "#src/character/createPmxGeometry";
import { createPmxSkeleton } from "#src/character/createPmxSkeleton";
import { Matrix4, SkinnedMesh } from "three";

// A PMX model as one skinned mesh, a material for each of the model's, its root bones held by the mesh and bound where
// They stand, and scaled from MMD's units into the world's metres. A file's four weights need not sum to one, so each
// Vertex's are scaled until they do
export const createPmxMesh = <TMaterial extends Material>(
  pmxModel: PmxModel,
  materials: TMaterial[],
): SkinnedMesh<BufferGeometry, TMaterial[]> => {
  const geometry = createPmxGeometry(pmxModel);
  const mesh = new SkinnedMesh(geometry, materials);
  const skeleton = createPmxSkeleton(pmxModel.bones);
  for (const bone of skeleton.bones) if (!bone.parent) mesh.add(bone);
  mesh.normalizeSkinWeights();
  mesh.bind(skeleton, new Matrix4());
  mesh.scale.setScalar(PMX_UNIT_METRES);
  return mesh;
};
