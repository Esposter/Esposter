import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";

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
// How many of a failing family's parts its note names
const NAMED_PART_COUNT = 5;
// The reason a family's depth or normal is read as when ours draws none of it where the exports do
const NO_OVERLAP_REASON = "no overlap";
// A reading of a family's shape, or the reason it has none where the two draw no pixel of it in common
const toShapeReading = (name: string, gate: number, unit: string, value: number | undefined): ParityPassReading =>
  value === undefined ? { gate, name, reason: NO_OVERLAP_REASON, unit } : { gate, name, unit, value };
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
    // A family's normals over their gate, named by the exported parts that carry most of their angle; one with no pixel
    // Both draw has no normals to name a part by, so its no-overlap reading alone reports it
    const partNotes = comparisons
      .filter(({ normal }) => normal !== undefined && normal > SHAPE_NORMAL_GATE_DEGREES)
      .map(({ family, partNormals }) => {
        const total = partNormals.reduce((sum, { angle }) => sum + angle, 0);
        const parts = partNormals
          .toSorted((firstPart, secondPart) => secondPart.angle - firstPart.angle)
          .slice(0, NAMED_PART_COUNT)
          .map(({ angle, part, pixelCount }) => {
            const mesh = exportsRead.parts.find(({ id }) => id === part)?.mesh ?? part;
            return `${mesh} #${part} ${((angle / total) * 100).toFixed(0)}% (${(angle / pixelCount).toFixed(1)} degrees over ${pixelCount} px)`;
          });
        return `${referenceId} ${exportsRead.families[family] ?? family} normal by part: ${parts.join(", ")}`;
      });
    return {
      notes: [`${referenceId} exports | ours | normals' angle and outlines apart: ${diffPath}`, ...partNotes],
      readings: comparisons.flatMap(({ depth, family, normal, outline }) => {
        const name = `${referenceId} ${exportsRead.families[family] ?? family}`;
        return [
          { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
          toShapeReading(`${name} depth`, SHAPE_DEPTH_GATE, "share", depth),
          toShapeReading(`${name} normal`, SHAPE_NORMAL_GATE_DEGREES, "degrees", normal),
        ];
      }),
    };
  });
