import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { COLOUR_GATE, SHAPE_OUTLINE_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { shiftTargetAcross } from "#src/services/genshinParity/passes/shiftTargetAcross";
import { writeStructureDiff } from "#src/services/genshinParity/passes/writeStructureDiff";
import { writeSurfaceDiff } from "#src/services/genshinParity/passes/writeSurfaceDiff";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Albedo];
// A family's structure at each scale, finest first, to three places
const formatScales = (scales: readonly number[]): string => scales.map((scale) => scale.toFixed(3)).join(" ");
// The surface pass: each family's unlit colour of ours against the exports' it stands for, where both draw it, and how
// Unlike their lightness is in structure. The colour is gated where two colours side by side are just told apart. The
// Structure is gated at what the exports' own albedo reads against itself moved across by the shape's outline gate, as
// Far as a shape the shape pass holds may stand off its place. A family too thin to meet its moved self reads no
// Structure there, so its gate is none rather than Infinity, which holds any. Each family's structure is noted scale by
// Scale beside its gate's, where a loss at the finest scale is its detail and at the coarsest its layout, and drawn
// Scale by scale where on the frame it is lost. A glow the materials add over their lit colour is lit, not unlit, so it
// Is scored by the light pass against the game's frame (`measureGlow`)
export const measureSurface = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead) => {
    const { families, width } = exportsRead;
    const exportsAlbedo = exportsRead.targets.albedo ?? new Float32Array();
    const exportsPart = exportsRead.targets.part ?? new Float32Array();
    const oursAlbedo = oursRead.targets.albedo ?? new Float32Array();
    const oursPart = oursRead.targets.part ?? new Float32Array();
    const exportsTargets = { colour: exportsAlbedo, part: exportsPart };
    const shiftedTargets = {
      colour: shiftTargetAcross(exportsAlbedo, width, SHAPE_OUTLINE_GATE_PIXELS),
      part: shiftTargetAcross(exportsPart, width, SHAPE_OUTLINE_GATE_PIXELS),
    };
    const familyGateMap = new Map(
      compareFamilyColour(exportsTargets, shiftedTargets, width, families.length).comparisons.map((comparison) => [
        comparison.family,
        { ...comparison, structure: Number.isFinite(comparison.structure) ? comparison.structure : 0 },
      ]),
    );
    const albedo = compareFamilyColour(exportsTargets, { colour: oursAlbedo, part: oursPart }, width, families.length);
    const [diffPath, structurePath] = await Promise.all([
      writeSurfaceDiff(
        referenceId,
        { albedo: exportsAlbedo, part: exportsPart },
        { albedo: oursAlbedo, part: oursPart },
        exportsRead,
      ),
      writeStructureDiff(referenceId, albedo.termMaps, exportsRead),
    ]);
    return {
      notes: [
        `${referenceId} exports | ours | lightness apart: ${diffPath}`,
        `${referenceId} structure lost, scale by scale finest first: ${structurePath}`,
        ...albedo.comparisons.map(
          ({ family, scales }) =>
            `${referenceId} ${families[family] ?? family} structure by scale, finest first: ${formatScales(scales)} against ${formatScales(familyGateMap.get(family)?.scales ?? [])} a pixel across`,
        ),
      ],
      readings: albedo.comparisons.flatMap(({ colour, family, structure }) => {
        const name = `${referenceId} ${families[family] ?? family}`;
        return [
          { gate: COLOUR_GATE, name: `${name} colour`, unit: "ΔE", value: colour },
          {
            gate: familyGateMap.get(family)?.structure ?? 0,
            name: `${name} structure`,
            unit: "share",
            value: structure,
          },
        ];
      }),
    };
  });
