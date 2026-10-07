import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import {
  SHAPE_DEPTH_GATE,
  SHAPE_NORMAL_GATE_DEGREES,
  SHAPE_OUTLINE_GATE_PIXELS,
} from "#src/services/genshinParity/passes/constants";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { writeShapeDiff } from "#src/services/genshinParity/passes/writeShapeDiff";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Depth, WitnessTargetName.Normal];
// The shape pass: each family of ours against the exports' it stands for, target by target (`compareFamilyTargets`):
// Its outline in pixels at the shape's width, and where both draw it, its depth's gap as a share and its normals' angle
export const measureShape = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead) => {
    const toTargets = ({
      targets,
    }: typeof exportsRead): { depth: Float32Array; normal: Float32Array; part: Float32Array } => ({
      depth: targets.depth ?? new Float32Array(),
      normal: targets.normal ?? new Float32Array(),
      part: targets.part ?? new Float32Array(),
    });
    const exportsTargets = toTargets(exportsRead);
    const oursTargets = toTargets(oursRead);
    const comparisons = compareFamilyTargets(
      exportsTargets,
      oursTargets,
      exportsRead.width,
      exportsRead.families.length,
    );
    const diffPath = await writeShapeDiff(referenceId, exportsTargets, oursTargets, exportsRead);
    return {
      notes: [`${referenceId} exports | ours | normals' angle and outlines apart: ${diffPath}`],
      readings: comparisons.flatMap(({ depth, family, normal, outline }) => {
        const name = `${referenceId} ${exportsRead.families[family] ?? family}`;
        return [
          { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
          { gate: SHAPE_DEPTH_GATE, name: `${name} depth`, unit: "share", value: depth },
          { gate: SHAPE_NORMAL_GATE_DEGREES, name: `${name} normal`, unit: "degrees", value: normal },
        ];
      }),
    };
  });
