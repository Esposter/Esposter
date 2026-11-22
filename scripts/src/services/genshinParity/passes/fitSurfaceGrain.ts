import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SurfaceDetail } from "genshin-engine";

import { computeFamilyMask } from "#src/services/genshinParity/passes/computeFamilyMask";
import { computeFamilyStructure } from "#src/services/genshinParity/passes/computeFamilyStructure";
import { GRAIN_MAX_ITERATIONS, GRAIN_TOLERANCE, SHAPE_WIDTH } from "#src/services/genshinParity/passes/constants";
import { readTargetLightness } from "#src/services/genshinParity/passes/readTargetLightness";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openSurfaceStatisticsPage } from "#src/services/genshinParity/shared/openSurfaceStatisticsPage";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { solveResidualsByNewton } from "#src/services/recreation/solve/solveResidualsByNewton";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { computeSurfaceOctaves, SURFACE_DETAIL_BAND_SIGMAS } from "genshin-engine";
import { WitnessTarget } from "genshin-world/sceneExport";

declare global {
  interface Window {
    getSceneSurfaceDetail: (family: string) => SurfaceDetail;
    setSceneSurfaceAmplitudes: (family: string, amplitudes: number[]) => void;
  }
}

// The targets a family's grain is read from: its exports' parts and albedo, and ours drawn beside them
const GRAIN_TARGETS = [WitnessTarget.Part, WitnessTarget.Albedo];

// Where a grain fit stopped: whether every structure term held its tolerance, the steps taken, the terms there in the
// Order `computeStructureTerms` gives them (the luminance's variance, then each octave band finest first), and the detail
export interface GrainFit {
  converged: boolean;
  detail: SurfaceDetail;
  iterations: number;
  residuals: number[];
}

// A family's grain fitted to its exports' structure at the reference's camera. The solve's unknowns are the detail's
// Targets (the bands and the variance, the metres a texel stays), each target's octaves set on the live scene and the
// Family's structure read back from the render, so every residual is one render and the response it solves over is the
// Render's own, coupling included. A per-term update that scales each target alone does not converge on that coupling
export const fitSurfaceGrain = async (
  component: DerivedAssetComponent,
  referenceId: string,
  family: string,
  pageRoot?: string,
): Promise<GrainFit> => {
  await fetchReferences();
  const { close, page } = await openWitnessPage(referenceId, component, SHAPE_WIDTH, undefined, undefined, pageRoot);
  return withFinalizerAsync(
    async () => {
      const { pose } = await solveReferenceCamera(page, referenceId, component);
      const camera = toPageCamera(pose);
      // The scene draws its own family only in our view, so its detail is read from that view
      await setPageWitnessView(page, { camera, families: [], isAlone: true });
      const start = await page.evaluate((name) => window.getSceneSurfaceDetail(name), family);
      await setPageWitnessView(page, { camera, isAlone: true });
      const exportsRead = await readWitnessTargets(page, GRAIN_TARGETS);
      const familyIndex = exportsRead.families.indexOf(family);
      if (familyIndex === -1)
        throw new InvalidOperationError(Operation.Read, family, `not a family of ${referenceId}'s exports`);
      const { width } = exportsRead;
      const exportsPart = exportsRead.targets.part ?? new Float32Array();
      const exportsLightness = readTargetLightness(exportsRead.targets.albedo ?? new Float32Array());
      const height = exportsPart.length / 4 / width;
      const surfaceStatistics = await openSurfaceStatisticsPage(pageRoot);
      return withFinalizerAsync(
        async () => {
          // The structure terms at a set of targets: each octave's amplitude set on the scene, ours drawn alone at the
          // Camera, and the family's terms read over the pixels both draw the family
          const residuals = async (targets: number[]): Promise<number[]> => {
            const detail = {
              bands: targets.slice(0, -1),
              metresPerTexel: start.metresPerTexel,
              variance: targets.at(-1) ?? 0,
            };
            const amplitudes = computeSurfaceOctaves(detail).map(({ amplitude }) => amplitude);
            await setPageWitnessView(page, { camera, families: [], isAlone: true });
            await page.evaluate(
              (grain: { amplitudes: number[]; family: string }) => {
                window.setSceneSurfaceAmplitudes(grain.family, grain.amplitudes);
              },
              { amplitudes, family },
            );
            const oursRead = await readWitnessTargets(page, GRAIN_TARGETS, true);
            const familyMask = computeFamilyMask(
              exportsPart,
              oursRead.targets.part ?? new Float32Array(),
              familyIndex,
              width,
            );
            const { terms } = await computeFamilyStructure(
              (values, mask) =>
                surfaceStatistics.computeStatistics(values, mask, width, height, SURFACE_DETAIL_BAND_SIGMAS),
              exportsLightness,
              readTargetLightness(oursRead.targets.albedo ?? new Float32Array()),
              familyMask,
            );
            return targets.map((_target, index) => terms.find((term) => term.index === index)?.error ?? 0);
          };
          const unknowns = [...start.bands, start.variance];
          const solved = await solveResidualsByNewton(residuals, unknowns, GRAIN_TOLERANCE, GRAIN_MAX_ITERATIONS, {
            lowerBounds: unknowns.map(() => 0),
          });
          return {
            converged: solved.converged,
            detail: {
              bands: solved.solution.slice(0, -1),
              metresPerTexel: start.metresPerTexel,
              variance: solved.solution.at(-1) ?? 0,
            },
            iterations: solved.iterations,
            residuals: solved.residuals,
          };
        },
        () => surfaceStatistics.close(),
      );
    },
    () => close(),
  );
};
