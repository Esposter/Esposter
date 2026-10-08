import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { COLOUR_GATE, SHAPE_OUTLINE_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { writeStructureDiff } from "#src/services/genshinParity/passes/writeStructureDiff";
import { writeSurfaceDiff } from "#src/services/genshinParity/passes/writeSurfaceDiff";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Albedo, WitnessTargetName.Emission];
// A target of four floats a pixel moved across by whole pixels, its first columns repeating the edge
const shiftAcross = (values: Float32Array, width: number, pixels: number): Float32Array =>
  Float32Array.from(values, (_value, index) => {
    const pixel = Math.floor(index / 4);
    const column = pixel % width;
    return values[(pixel - Math.min(column, pixels)) * 4 + (index % 4)] ?? 0;
  });
// A family's structure at each scale, finest first, to three places
const formatScales = (scales: readonly number[]): string => scales.map((scale) => scale.toFixed(3)).join(" ");
// The surface pass: each family's unlit colour of ours against the exports' it stands for, where both draw it, and its
// Glow, the emission its shader adds over its lit colour, alike (`compareFamilyColour`): the distance between their
// Mean colours, gated where two colours side by side are just told apart, and how unlike their lightness is in
// Structure, gated at what the exports' own target reads against itself moved across by the shape's outline gate, as far
// As a shape the shape pass holds may stand off its place. A family too thin to meet its moved self reads no structure
// There, so its gate is none rather than Infinity, which holds any. Each family's albedo structure is noted scale by
// Scale beside its gate's, where a loss at the finest scale is its detail and at the coarsest its layout, and drawn
// Scale by scale where on the frame it is lost
export const measureSurface = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead) => {
    const { families, width } = exportsRead;
    const exportsPart = exportsRead.targets.part ?? new Float32Array();
    const oursPart = oursRead.targets.part ?? new Float32Array();
    const shiftedPart = shiftAcross(exportsPart, width, SHAPE_OUTLINE_GATE_PIXELS);
    // Each family's comparison in one colour target, and its structure's gate from the exports' own moved across
    const compareTarget = (name: WitnessTargetName.Albedo | WitnessTargetName.Emission) => {
      const exportsTargets = { colour: exportsRead.targets[name] ?? new Float32Array(), part: exportsPart };
      const oursTargets = { colour: oursRead.targets[name] ?? new Float32Array(), part: oursPart };
      const shiftedTargets = {
        colour: shiftAcross(exportsTargets.colour, width, SHAPE_OUTLINE_GATE_PIXELS),
        part: shiftedPart,
      };
      const familyGateMap = new Map(
        compareFamilyColour(exportsTargets, shiftedTargets, width, families.length).comparisons.map((comparison) => [
          comparison.family,
          { ...comparison, structure: Number.isFinite(comparison.structure) ? comparison.structure : 0 },
        ]),
      );
      return { ...compareFamilyColour(exportsTargets, oursTargets, width, families.length), familyGateMap };
    };
    const albedo = compareTarget(WitnessTargetName.Albedo);
    const glow = compareTarget(WitnessTargetName.Emission);
    const [diffPath, structurePath] = await Promise.all([
      writeSurfaceDiff(
        referenceId,
        { albedo: exportsRead.targets.albedo ?? new Float32Array(), part: exportsPart },
        { albedo: oursRead.targets.albedo ?? new Float32Array(), part: oursPart },
        exportsRead,
      ),
      writeStructureDiff(referenceId, albedo.termMaps, exportsRead),
    ]);
    const toReadings = (
      { comparisons, familyGateMap }: ReturnType<typeof compareTarget>,
      label: string,
    ): ParityPassMeasure["readings"] =>
      comparisons.flatMap(({ colour, family, structure }) => {
        const name = `${referenceId} ${families[family] ?? family}${label}`;
        return [
          { gate: COLOUR_GATE, name: `${name} colour`, unit: "ΔE", value: colour },
          {
            gate: familyGateMap.get(family)?.structure ?? 0,
            name: `${name} structure`,
            unit: "share",
            value: structure,
          },
        ];
      });
    return {
      notes: [
        `${referenceId} exports | ours | lightness apart: ${diffPath}`,
        `${referenceId} structure lost, scale by scale finest first: ${structurePath}`,
        ...albedo.comparisons.map(
          ({ family, scales }) =>
            `${referenceId} ${families[family] ?? family} structure by scale, finest first: ${formatScales(scales)} against ${formatScales(albedo.familyGateMap.get(family)?.scales ?? [])} a pixel across`,
        ),
      ],
      readings: [...toReadings(albedo, ""), ...toReadings(glow, " glow")],
    };
  });
