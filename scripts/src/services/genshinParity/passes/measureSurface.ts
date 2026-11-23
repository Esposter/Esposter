import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";
import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { computeFamilyMask } from "#src/services/genshinParity/passes/computeFamilyMask";
import { computeFamilyStructure } from "#src/services/genshinParity/passes/computeFamilyStructure";
import { computeMedianMetresPerPixel } from "#src/services/genshinParity/passes/computeMedianMetresPerPixel";
import { computeStructureError } from "#src/services/genshinParity/passes/computeStructureError";
import { COLOUR_GATE } from "#src/services/genshinParity/passes/constants";
import { formatScales } from "#src/services/genshinParity/passes/formatScales";
import { formatStructureTerms } from "#src/services/genshinParity/passes/formatStructureTerms";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { readTargetLightness } from "#src/services/genshinParity/passes/readTargetLightness";
import { writeStructureDiff } from "#src/services/genshinParity/passes/writeStructureDiff";
import { writeSurfaceDiff } from "#src/services/genshinParity/passes/writeSurfaceDiff";
import { openSurfaceStatisticsPage } from "#src/services/genshinParity/shared/openSurfaceStatisticsPage";
import { computeLabelSimilarity } from "#src/services/genshinParity/witness/computeLabelSimilarity";
import { withFinalizerAsync } from "@esposter/shared";
import { SURFACE_DETAIL_BAND_SIGMAS } from "genshin-engine";
import { WitnessTarget } from "genshin-world/sceneExport";

const TARGET_NAMES: WitnessTarget[] = [WitnessTarget.Part, WitnessTarget.Albedo, WitnessTarget.Depth];
// The reason a family's structure is read as when the exports draw it within one half of the blocks, so no gate is read
const NO_GATE_REASON = "no gate: the family lies within one half";

// The surface pass: each family's unlit colour of ours against the exports' it stands for, where both draw it, and how
// Unlike their structure is. The colour is gated where two colours side by side are just told apart. The structure is
// Statistical: over the pixels both draw the family, the luminance's variance and each octave band's detail energy of
// Ours against the exports', as the root mean square relative error (`computeStatisticalStructure`). The exports'
// Textures are never shipped, so a pixel-aligned structure cannot be met, and a surface is matched in distribution. Its
// Gate is the sampling floor: the exports' own family split into two halves of blocks, each measured against the other,
// So a surface of the same distribution reads at the least a finite patch can. The pixel-aligned structure of each
// Family stays in the notes, scale by scale, as a diagnostic of where Its detail lies. A glow the materials add over
// Their lit colour is lit, not unlit, so it is scored by the light pass Against the game's frame (`measureGlow`)
export const measureSurface = (component: DerivedAssetComponent, pageRoot?: string): Promise<ParityPassMeasure> =>
  measureFamilyTargets(
    component,
    TARGET_NAMES,
    async (referenceId, exportsRead, oursRead, page, camera) => {
      const { families, width } = exportsRead;
      const exportsDepth = exportsRead.targets.depth ?? new Float32Array();
      const exportsAlbedo = exportsRead.targets.albedo ?? new Float32Array();
      const exportsPart = exportsRead.targets.part ?? new Float32Array();
      const oursAlbedo = oursRead.targets.albedo ?? new Float32Array();
      const oursPart = oursRead.targets.part ?? new Float32Array();
      const exportsTargets = { colour: exportsAlbedo, part: exportsPart };
      const height = exportsPart.length / 4 / width;
      // A family's pixel at its median depth, the metres a pixel of the surface's structure spans where the family
      // Stands
      const familyPixelMetres = families.map((_name, family) =>
        computeMedianMetresPerPixel({
          depths: [...computeFamilyMask(exportsPart, exportsPart, family, width)].flatMap((isDrawn, pixel) =>
            isDrawn ? [exportsDepth[pixel * 4] ?? 0] : [],
          ),
          fovDegrees: camera.fov,
          height,
        }),
      );
      const exportsLightness = readTargetLightness(exportsAlbedo);
      const oursLightness = readTargetLightness(oursAlbedo);
      const albedo = await compareFamilyColour(
        exportsTargets,
        { colour: oursAlbedo, part: oursPart },
        width,
        families.length,
        (input) => computeLabelSimilarity(page, input),
      );
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
      // Other, the least a surface of the same distribution can read off a finite patch of it. A family held within one
      // Half has no floor to read, so it has no gate
      // The statistics are reduced on the parity page's GPU, which the page is opened for once per surface
      const surfaceStatistics = await openSurfaceStatisticsPage(pageRoot);
      const measured = await withFinalizerAsync(
        () =>
          Promise.all(
            albedo.comparisons.map(async (comparison) => {
              const statisticsOf = (values: Float32Array, mask: Uint8Array) =>
                surfaceStatistics.computeStatistics(values, mask, width, height, SURFACE_DETAIL_BAND_SIGMAS);
              const evenMask = computeFamilyMask(exportsPart, exportsPart, comparison.family, width, 0);
              const oddMask = computeFamilyMask(exportsPart, exportsPart, comparison.family, width, 1);
              const familyMask = computeFamilyMask(exportsPart, oursPart, comparison.family, width);
              const meanOf = (values: Float32Array): number => {
                let sum = 0;
                let count = 0;
                for (const [pixel, value] of values.entries())
                  if (familyMask[pixel]) {
                    sum += value;
                    count++;
                  }
                return count === 0 ? 0 : sum / count;
              };
              const readGate = async () => {
                if (!evenMask.includes(1) || !oddMask.includes(1)) return undefined;
                const [gateReference, gateShot] = await Promise.all([
                  statisticsOf(exportsLightness, evenMask),
                  statisticsOf(exportsLightness, oddMask),
                ]);
                return computeStructureError(gateReference, gateShot);
              };
              const [gate, { structure, terms }] = await Promise.all([
                readGate(),
                computeFamilyStructure(statisticsOf, exportsLightness, oursLightness, familyMask),
              ]);
              return {
                colour: comparison.colour,
                family: comparison.family,
                gate,
                meanExports: meanOf(exportsLightness),
                meanOurs: meanOf(oursLightness),
                scales: comparison.scales,
                structure,
                terms,
              };
            }),
          ),
        () => surfaceStatistics.close(),
      );
      return {
        notes: [
          `${referenceId} exports | ours | lightness apart: ${diffPath}`,
          `${referenceId} structure lost, scale by scale finest first (pixel-aligned, diagnostic): ${structurePath}`,
          ...measured.map(
            ({ family, scales }) =>
              `${referenceId} ${families[family] ?? family} structure by scale, finest first (pixel-aligned, diagnostic): ${formatScales(scales)}`,
          ),
          ...families.map(
            (name, family) =>
              `${referenceId} ${name} pixel at its median depth: ${(familyPixelMetres[family] ?? 0).toFixed(4)} m`,
          ),
          ...measured.map(
            ({ family, meanExports, meanOurs }) =>
              `${referenceId} ${families[family] ?? family} mean lightness (exports | ours): ${meanExports.toFixed(4)} | ${meanOurs.toFixed(4)}`,
          ),
          ...measured.map(
            ({ family, terms }) =>
              `${referenceId} ${families[family] ?? family} structure terms, variance then bands finest first (exports | ours | error): ${formatStructureTerms(terms)}`,
          ),
        ],
        readings: measured.flatMap(({ colour, family, gate, structure }): ParityPassReading[] => {
          const name = `${referenceId} ${families[family] ?? family}`;
          return [
            { gate: COLOUR_GATE, name: `${name} colour`, unit: "ΔE", value: colour },
            gate === undefined
              ? { gate: 0, name: `${name} structure`, reason: NO_GATE_REASON, unit: "share" }
              : { gate, name: `${name} structure`, unit: "share", value: structure },
          ];
        }),
      };
    },
    pageRoot,
  );
