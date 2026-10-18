import type { PmxModel } from "#src/models/character/PmxModel";
import type { BufferGeometry, Material } from "three";

import { createPmxGeometry } from "#src/character/createPmxGeometry";
import { createPmxSkeleton } from "#src/character/createPmxSkeleton";
import { SkinnedMesh } from "three";

// A PMX model as one skinned mesh, a material for each of the model's, its root bones held by the mesh, and scaled from
// MMD's units into the world's metres at the metres each unit stands for. The mesh is bound once it is scaled, so the rest
// Pose skins each vertex where the file has it: a bind taken before the scale would scale every vertex twice. A file's four
// Weights need not sum to one, so each vertex's are scaled until they do
export const createPmxMesh = <TMaterial extends Material>(
  pmxModel: PmxModel,
  materials: TMaterial[],
  unitMetres: number,
): SkinnedMesh<BufferGeometry, TMaterial[]> => {
  const geometry = createPmxGeometry(pmxModel);
  const mesh = new SkinnedMesh(geometry, materials);
  const skeleton = createPmxSkeleton(pmxModel.bones);
  for (const bone of skeleton.bones) if (!bone.parent) mesh.add(bone);
  mesh.normalizeSkinWeights();
  mesh.scale.setScalar(unitMetres);
  mesh.bind(skeleton);
  return mesh;
};
