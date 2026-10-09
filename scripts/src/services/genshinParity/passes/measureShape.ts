import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import { computeNormalMapAngles } from "#src/services/genshinParity/passes/computeNormalMapAngles";
import {
  SHAPE_DEPTH_GATE,
  SHAPE_NORMAL_GATE_DEGREES,
  SHAPE_OUTLINE_GATE_PIXELS,
} from "#src/services/genshinParity/passes/constants";
import { measureEnvelope } from "#src/services/genshinParity/passes/measureEnvelope";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { toShapeReading } from "#src/services/genshinParity/passes/toShapeReading";
import { writeShapeDiff } from "#src/services/genshinParity/passes/writeShapeDiff";

const TARGET_NAMES = [
  WitnessTargetName.Part,
  WitnessTargetName.Depth,
  WitnessTargetName.Normal,
  WitnessTargetName.GeometryNormal,
];
// How many of a failing family's parts its note names
const NAMED_PART_COUNT = 5;
// The shape pass: each family of ours against the exports' it stands for, target by target (`compareFamilyTargets`):
// Its outline in pixels at the shape's width, and where both draw it, its depth's gap as a share and its normals' angle.
// Its notes give each family's own normal maps' bend (`computeNormalMapAngles`), the least a stand-in drawn without them
// Reads on the normal
export const measureShape = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead, page, camera) => {
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
    const mapNotes = computeNormalMapAngles(
      exportsTargets.normal,
      exportsRead.targets.geometryNormal ?? new Float32Array(),
      exportsTargets.part,
      exportsRead.width,
      exportsRead.families.length,
    ).map(
      ({ angle, family, halves: [evenAngle, oddAngle] }) =>
        `${referenceId} ${exportsRead.families[family] ?? family}'s own normal maps bend its normals ${angle.toFixed(1)} degrees (${evenAngle.toFixed(1)} and ${oddAngle.toFixed(1)} over its halves of blocks), the least a stand-in drawn without them reads`,
    );
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
    const envelopeReadings = await measureEnvelope(referenceId, exportsRead, oursRead, page, camera);
    return {
      notes: [
        `${referenceId} exports | ours | normals' angle and outlines apart: ${diffPath}`,
        ...partNotes,
        ...mapNotes,
      ],
      readings: [
        ...comparisons.flatMap(({ depth, family, normal, outline }) => {
          const name = `${referenceId} ${exportsRead.families[family] ?? family}`;
          return [
            { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
            toShapeReading(`${name} depth`, SHAPE_DEPTH_GATE, "share", depth),
            toShapeReading(`${name} normal`, SHAPE_NORMAL_GATE_DEGREES, "degrees", normal),
          ];
        }),
        ...envelopeReadings,
      ],
    };
  });
