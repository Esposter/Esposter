import type { Targets } from "#src/models/genshinParity/passes/Targets";
import type { WitnessTargetsRead } from "#src/models/genshinParity/passes/WitnessTargetsRead";

// The normal is the geometry's, before the exports' normal maps bend it, as the shape pass reads every family's
export const toTargets = ({ targets }: WitnessTargetsRead): Targets => ({
  depth: targets.depth ?? new Float32Array(),
  normal: targets.geometryNormal ?? new Float32Array(),
  part: targets.part ?? new Float32Array(),
});
