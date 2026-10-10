import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import { computeSurfaceBend, getSurfaceBendReading } from "#src/services/genshinParity/passes/computeSurfaceBend";
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
// The shape pass: each family of ours against the exports' it stands for, target by target (`compareFamilyTargets`).
// Its normal is read on the geometry, the normal before the exports' normal maps, both sides drawn without them, at
// `SHAPE_NORMAL_GATE_DEGREES`. The maps' bend is gated on its own (`getSurfaceBendReading`): ours' bend less the
// Exports', against the floor the exports' two halves stand apart by. The map-included normal stays a diagnostic.
export const measureShape = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead, page, camera) => {
    const toTargets = ({
      targets,
    }: typeof exportsRead): {
      depth: Float32Array;
      geometryNormal: Float32Array;
      normal: Float32Array;
      part: Float32Array;
    } => ({
      depth: targets.depth ?? new Float32Array(),
      geometryNormal: targets.geometryNormal ?? new Float32Array(),
      normal: targets.normal ?? new Float32Array(),
      part: targets.part ?? new Float32Array(),
    });
    const exportsTargets = toTargets(exportsRead);
    const oursTargets = toTargets(oursRead);
    const familyCount = exportsRead.families.length;
    const comparisons = compareFamilyTargets(
      { ...exportsTargets, normal: exportsTargets.geometryNormal },
      { ...oursTargets, normal: oursTargets.geometryNormal },
      exportsRead.width,
      familyCount,
    );
    const mapComparisons = compareFamilyTargets(exportsTargets, oursTargets, exportsRead.width, familyCount);
    const surfaceBends = computeSurfaceBend(exportsTargets, oursTargets, exportsRead.width, familyCount);
    const diffPath = await writeShapeDiff(referenceId, exportsTargets, oursTargets, exportsRead);
    const familyName = (family: number): string => `${referenceId} ${exportsRead.families[family] ?? family}`;
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
        return `${familyName(family)} normal by part: ${parts.join(", ")}`;
      });
    const bendNotes = surfaceBends.map((surfaceBend) => {
      const { gate, value } = getSurfaceBendReading(surfaceBend);
      const [firstHalf, secondHalf] = surfaceBend.halves;
      const owed =
        value > gate
          ? `; owed: procedural normal detail on ${exportsRead.families[surfaceBend.family] ?? surfaceBend.family}'s material, fitted to the exports' bend`
          : "";
      return `${familyName(surfaceBend.family)} surface detail: its exports' normal maps bend its normals ${surfaceBend.exportsAngle.toFixed(1)} degrees (${firstHalf.toFixed(1)} and ${secondHalf.toFixed(1)} over its halves of blocks), ours ${surfaceBend.oursAngle.toFixed(1)} degrees, gated at ${gate.toFixed(1)}${owed}`;
    });
    const mapNotes = mapComparisons
      .filter(({ normal }) => normal !== undefined)
      .map(
        ({ family, normal }) =>
          `${familyName(family)} normal with its normal maps (diagnostic): ${normal?.toFixed(1)} degrees`,
      );
    const envelopeReadings = await measureEnvelope(referenceId, exportsRead, oursRead, page, camera);
    return {
      notes: [
        `${referenceId} exports | ours | normals' angle and outlines apart: ${diffPath}`,
        ...partNotes,
        ...bendNotes,
        ...mapNotes,
      ],
      readings: [
        ...comparisons.flatMap(({ depth, family, normal, outline }) => {
          const name = familyName(family);
          return [
            { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
            toShapeReading(`${name} depth`, SHAPE_DEPTH_GATE, "share", depth),
            toShapeReading(`${name} normal`, SHAPE_NORMAL_GATE_DEGREES, "degrees", normal),
          ];
        }),
        ...surfaceBends.map((surfaceBend) => {
          const { gate, value } = getSurfaceBendReading(surfaceBend);
          return toShapeReading(`${familyName(surfaceBend.family)} surface detail bend`, gate, "degrees", value);
        }),
        ...envelopeReadings,
      ],
    };
  });
