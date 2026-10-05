import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetCloudCover } from "#src/models/genshinParity/sky/SetCloudCover";
import type { SetCloudHeights } from "#src/models/genshinParity/sky/SetCloudHeights";
import type { Browser, Page } from "playwright";

import { CLOUDS_WIDTH } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { readCloudSky } from "#src/services/genshinParity/sky/readCloudSky";
import { withFinalizerAsync } from "@esposter/shared";

// Each share starts at three in four, the simplex's first step in its logit as wide as from there to even odds and
// Past: the cover steps by whole clouds, so a search with no gradient finds its way where a descent's Jacobian stalls
const START_LOGIT = Math.log(3);
const LOGIT_STEP = 1.5;
const ITERATION_COUNT = 40;
// A band's heights are its lowest and the logarithm of its span, so its top never falls under its foot: the first step
// Moves the foot by half the band's own span and the span by about half again
const HEIGHT_SPAN_SHARE = 0.5;
const LOG_SPAN_STEP = 0.4;
const HEIGHT_ITERATION_COUNT = 60;
const toShare = (logit: number): number => 1 / (1 + Math.exp(-logit));
const computeSquaredResidual = (ours: readonly number[], reference: readonly number[]): number =>
  ours.reduce((sum, value, index) => sum + (value - (reference[index] ?? 0)) ** 2, 0);
// The share of each band's clouds the scene should draw at each reference's hour, by the sky's cover band by band of
// Its height over the horizon: our sky drawn at each guess and its clouds read as the reference's are (`readCloudSky`),
// At the reference's own split between cloud and clear sky, the shares solved by the simplex in their logits so each
// Stays between none and all. A cloud standing elsewhere than the reference's costs nothing here, where a score
// Comparing pixels charges it twice, so the cover is matched in kind rather than in place. The heights each band's
// Clouds stand between are one scene's for every hour, so with `isHeightSolved` they are solved on every reference at
// Once, each hour's shares held, and the shares solved again under them, by turns
export const solveReferenceCloudCover = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
  { isHeightSolved, roundCount }: { isHeightSolved: boolean; roundCount: number },
): Promise<{
  heights: Record<string, [number, number]>;
  references: {
    covers: Record<string, number>;
    ours: number[];
    reference: number[];
    referenceId: string;
    residual: number;
  }[];
  residual: number;
}> => {
  await fetchReferences();
  const browsers: Browser[] = [];
  return withFinalizerAsync(
    async () => {
      const skies: {
        page: Page;
        readOurs: (covers: Record<string, number>, heights: Record<string, [number, number]>) => Promise<number[]>;
        reference: number[];
        referenceId: string;
      }[] = [];
      for (const referenceId of referenceIds) {
        // oxlint-disable-next-line no-await-in-loop -- each page is opened in turn, so one that fails leaves the opened ones to close
        const { browser, checkIsScored, height, image, page } = await openWitnessPage(
          referenceId,
          witness,
          CLOUDS_WIDTH,
        );
        browsers.push(browser);
        // oxlint-disable-next-line no-await-in-loop -- read on the page just opened
        const { computeClouds, computeCloudThreshold, computeElevationCoverage, readLuminance } = await readCloudSky(
          page,
          { checkIsScored, height },
        );
        // oxlint-disable-next-line no-await-in-loop -- read on the page just opened
        const referenceLuminance = await readLuminance(image);
        // Our clouds are read at the reference's split: split on our own render, each guess moved the split with its
        // Clouds, and the solve chased a cost that moved under it
        const threshold = computeCloudThreshold(referenceLuminance);
        skies.push({
          page,
          readOurs: async (covers, heights) => {
            await page.evaluate(
              ([pageCovers, pageHeights]) => {
                (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)(pageCovers);
                (Reflect.get(window, "setSceneCloudHeights") as SetCloudHeights)(pageHeights);
              },
              [covers, heights] as const,
            );
            await setPageWitnessView(page, { families: [] });
            return computeElevationCoverage(computeClouds(await readLuminance(await page.screenshot()), threshold));
          },
          reference: computeElevationCoverage(computeClouds(referenceLuminance, threshold)),
          referenceId,
        });
      }
      const [first] = skies;
      if (!first) return { heights: {}, references: [], residual: 0 };
      const bands = await first.page.evaluate(() => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)());
      let heights = await first.page.evaluate(() => (Reflect.get(window, "setSceneCloudHeights") as SetCloudHeights)());
      const toCovers = (logits: readonly number[]): Record<string, number> =>
        Object.fromEntries(bands.map((band, index) => [band, toShare(logits[index] ?? 0)]));
      const toHeights = (point: readonly number[]): Record<string, [number, number]> =>
        Object.fromEntries(
          bands.map((band, index): [string, [number, number]] => {
            const low = point[index * 2] ?? 0;
            return [band, [low, low + Math.exp(point[index * 2 + 1] ?? 0)]];
          }),
        );
      const fromHeights = (bandHeights: Record<string, [number, number]>): number[] =>
        bands.flatMap((band) => {
          const [low = 0, high = 1] = bandHeights[band] ?? [];
          return [low, Math.log(high - low)];
        });
      const logits = skies.map(() => bands.map(() => START_LOGIT));
      const solveCovers = async (): Promise<void> => {
        await Promise.all(
          skies.map(async (sky, index) => {
            const { point } = await minimizeNelderMead(
              async (guess) => computeSquaredResidual(await sky.readOurs(toCovers(guess), heights), sky.reference),
              logits[index] ?? [],
              bands.map(() => LOGIT_STEP),
              ITERATION_COUNT,
            );
            logits[index] = point;
          }),
        );
      };
      // The heights read on every reference's cover at once, each drawn at its own hour's shares
      const solveHeights = async (
        start: Record<string, [number, number]>,
      ): Promise<Record<string, [number, number]>> => {
        const { point } = await minimizeNelderMead(
          async (guess) => {
            const ours = await Promise.all(
              skies.map((sky, index) => sky.readOurs(toCovers(logits[index] ?? []), toHeights(guess))),
            );
            return ours.reduce(
              (sum, coverage, index) => sum + computeSquaredResidual(coverage, skies[index]?.reference ?? []),
              0,
            );
          },
          fromHeights(start),
          bands.flatMap((band) => {
            const [low = 0, high = 1] = start[band] ?? [];
            return [(high - low) * HEIGHT_SPAN_SHARE, LOG_SPAN_STEP];
          }),
          HEIGHT_ITERATION_COUNT,
        );
        return toHeights(point);
      };
      await solveCovers();
      if (isHeightSolved)
        for (let round = 0; round < roundCount; round++) {
          // oxlint-disable-next-line no-await-in-loop -- each round's heights are solved under the shares the last solved
          heights = await solveHeights(heights);
          // oxlint-disable-next-line no-await-in-loop -- the shares are solved again under the heights just solved
          await solveCovers();
        }
      const references = await Promise.all(
        skies.map(async ({ readOurs, reference, referenceId }, index) => {
          const covers = toCovers(logits[index] ?? []);
          const ours = await readOurs(covers, heights);
          return {
            covers,
            ours,
            reference,
            referenceId,
            residual: Math.sqrt(computeSquaredResidual(ours, reference) / Math.max(reference.length, 1)),
          };
        }),
      );
      const squaredResidual = references.reduce(
        (sum, { ours, reference }) => sum + computeSquaredResidual(ours, reference),
        0,
      );
      const residualCount = references.reduce((sum, { reference }) => sum + reference.length, 0);
      return { heights, references, residual: Math.sqrt(squaredResidual / Math.max(residualCount, 1)) };
    },
    async () => {
      await Promise.all(browsers.map((browser) => browser.close()));
    },
  );
};
