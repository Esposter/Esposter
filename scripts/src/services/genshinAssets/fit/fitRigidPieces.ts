import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { ExportedMesh } from "#src/models/genshinAssets/shared/ExportedMesh";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Matrix4, Quaternion, Vector3 } from "three";

// A bone's whole weight is under this far from one
const RIGID_WEIGHT_TOLERANCE = 1e-4;
// A skinned mesh whose every vertex follows one bone, split into the pieces its bones carry: each vertex's piece, and
// Each piece's pose at every sample of a clip that ends with the mesh as it is bound, as the matrix carrying the piece
// From where the mesh binds it, in the mesh's own space and the game's axes. A bone's world is its fathers' times its
// Own transform, and its fathers' are what its bind pose leaves of its own at the clip's end, so a pose is the bind
// Pose's inverse times the bone's end transform's inverse times its transform at the sample times the bind pose. A
// Property the clip binds no curve to is read as the identity's, and a bone it binds none to holds still
export const fitRigidPieces = (
  { m_BindPose, m_BoneNameHashes, m_Skin }: ExportedMesh,
  { curves }: DecodedClip,
): { poses: Matrix4[][]; vertexPieces: number[] } => {
  const vertexPieces = m_Skin.map(({ boneIndex, weight }, vertex) => {
    const [bone = 0] = boneIndex;
    const [boneWeight = 0] = weight;
    if (boneWeight < 1 - RIGID_WEIGHT_TOLERANCE)
      throw new InvalidOperationError(
        Operation.Read,
        `vertex ${vertex}`,
        `weighs ${boneWeight} on its first bone: a soft skin has no rigid pieces`,
      );
    return bone;
  });
  const sampleCount = Math.max(...curves.map(({ samples }) => samples.length), 1);
  const poses = m_BoneNameHashes.map((hash, bone) => {
    const bindPose = m_BindPose[bone];
    if (!bindPose) throw new InvalidOperationError(Operation.Read, `bone ${bone}`, "has no bind pose");
    const bind = new Matrix4().fromArray(
      ([0, 1, 2, 3] as const).flatMap((column) => ([0, 1, 2, 3] as const).map((row) => bindPose[`M${column}${row}`])),
    );
    const boneCurves = curves.filter(({ pathHash }) => pathHash === hash);
    const read = (property: string, component: string, sample: number, rest: number): number => {
      const samples = boneCurves.find((curve) => curve.property === property && curve.component === component)?.samples;
      return samples?.[Math.min(sample, samples.length - 1)] ?? rest;
    };
    const getTransform = (sample: number): Matrix4 =>
      new Matrix4().compose(
        new Vector3(
          read("position", "x", sample, 0),
          read("position", "y", sample, 0),
          read("position", "z", sample, 0),
        ),
        new Quaternion(
          read("rotation", "x", sample, 0),
          read("rotation", "y", sample, 0),
          read("rotation", "z", sample, 0),
          read("rotation", "w", sample, 1),
        ).normalize(),
        new Vector3(read("scale", "x", sample, 1), read("scale", "y", sample, 1), read("scale", "z", sample, 1)),
      );
    const unbind = bind
      .clone()
      .invert()
      .multiply(getTransform(sampleCount - 1).invert());
    return Array.from({ length: sampleCount }, (_value, sample) =>
      unbind.clone().multiply(getTransform(sample)).multiply(bind),
    );
  });
  return { poses, vertexPieces };
};
