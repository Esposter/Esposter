import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { COLOUR_GATE } from "#src/services/genshinParity/passes/constants";
import { computeStatisticalStructure } from "#src/services/genshinParity/passes/computeStatisticalStructure";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { readTargetLightness } from "#src/services/genshinParity/passes/readTargetLightness";
import { writeStructureDiff } from "#src/services/genshinParity/passes/writeStructureDiff";
import { writeSurfaceDiff } from "#src/services/genshinParity/passes/writeSurfaceDiff";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Albedo];
// A family's structure at each scale, finest first, to three places
const formatScales = (scales: readonly number[]): string => scales.map((scale) => scale.toFixed(3)).join(" ");
// The square of a block a family's pixels are split into two halves by, so each half spreads over the whole surface
const SPLIT_BLOCK_PIXELS = 32;
// The pixels both part targets draw a family at, as a mask over the pixels, and the half of it ('even' or 'odd' blocks)
const computeFamilyMask = (
  firstPart: Float32Array,
  secondPart: Float32Array,
  family: number,
  width: number,
  half?: 0 | 1,
): Uint8Array =>
  Uint8Array.from({ length: firstPart.length / 4 }, (_value, pixel) => {
    const isDrawn = readTargetFamily(firstPart, pixel) === family && readTargetFamily(secondPart, pixel) === family;
    if (!isDrawn) return 0;
    if (half === undefined) return 1;
    const blockX = Math.floor((pixel % width) / SPLIT_BLOCK_PIXELS);
    const blockY = Math.floor(Math.floor(pixel / width) / SPLIT_BLOCK_PIXELS);
    return (blockX + blockY) % 2 === half ? 1 : 0;
  });
// The surface pass: each family's unlit colour of ours against the exports' it stands for, where both draw it, and how
// Unlike their structure is. The colour is gated where two colours side by side are just told apart. The structure is
// Statistical: over the pixels both draw the family, the luminance's variance and each octave band's detail energy of
// Ours against the exports', as the root mean square relative error (`computeStatisticalStructure`). The exports'
// Textures are never shipped, so a pixel-aligned structure cannot be met, and a surface is matched in distribution. Its
// Gate is the sampling floor: the exports' own family split into two halves of blocks, each measured against the other,
// So a surface of the same distribution reads at the least a finite patch can. The pixel-aligned structure of each family stays in the notes, scale by scale, as a diagnostic of where
// Its detail lies. A glow the materials add over their lit colour is lit, not unlit, so it is scored by the light pass
// Against the game's frame (`measureGlow`)
export const measureSurface = (component: DerivedAssetComponent): Promise<ParityPassMeasure> =>
  measureFamilyTargets(component, TARGET_NAMES, async (referenceId, exportsRead, oursRead) => {
    const { families, width } = exportsRead;
    const exportsAlbedo = exportsRead.targets.albedo ?? new Float32Array();
    const exportsPart = exportsRead.targets.part ?? new Float32Array();
    const oursAlbedo = oursRead.targets.albedo ?? new Float32Array();
    const oursPart = oursRead.targets.part ?? new Float32Array();
    const exportsTargets = { colour: exportsAlbedo, part: exportsPart };
    const height = exportsPart.length / 4 / width;
    const exportsLightness = readTargetLightness(exportsAlbedo);
    const oursLightness = readTargetLightness(oursAlbedo);
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
    // The gate is the sampling floor: the exports' family split into two halves of blocks, each measured against the
    // Other, the least a surface of the same distribution can read off a finite patch of it
    const measured = albedo.comparisons.map((comparison) => ({
      ...comparison,
      gate: computeStatisticalStructure(
        exportsLightness,
        exportsLightness,
        computeFamilyMask(exportsPart, exportsPart, comparison.family, width, 0),
        computeFamilyMask(exportsPart, exportsPart, comparison.family, width, 1),
        width,
        height,
      ),
      structure: computeStatisticalStructure(
        exportsLightness,
        oursLightness,
        computeFamilyMask(exportsPart, oursPart, comparison.family, width),
        computeFamilyMask(exportsPart, oursPart, comparison.family, width),
        width,
        height,
      ),
    }));
    return {
      notes: [
        `${referenceId} exports | ours | lightness apart: ${diffPath}`,
        `${referenceId} structure lost, scale by scale finest first (pixel-aligned, diagnostic): ${structurePath}`,
        ...measured.map(
          ({ family, scales }) =>
            `${referenceId} ${families[family] ?? family} structure by scale, finest first (pixel-aligned, diagnostic): ${formatScales(scales)}`,
        ),
      ],
      readings: measured.flatMap(({ colour, family, gate, structure }) => {
        const name = `${referenceId} ${families[family] ?? family}`;
        return [
          { gate: COLOUR_GATE, name: `${name} colour`, unit: "ΔE", value: colour },
          { gate, name: `${name} structure`, unit: "share", value: structure },
        ];
      }),
    };
  });
