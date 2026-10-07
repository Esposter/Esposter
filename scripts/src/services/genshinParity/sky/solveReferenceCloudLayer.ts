import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { SetCloudCover } from "#src/models/genshinParity/sky/SetCloudCover";
import type { SetCloudLayer } from "#src/models/genshinParity/sky/SetCloudLayer";

import { CLOUDS_WIDTH, WITNESS_PATH_PREFIX } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { formatSkyComparison } from "#src/services/genshinParity/sky/formatSkyComparison";
import { readSkyComparison } from "#src/services/genshinParity/sky/readSkyComparison";
import { toSkyReadings } from "#src/services/genshinParity/sky/toSkyReadings";
import { writeCloudSheet } from "#src/services/genshinParity/sky/writeCloudSheet";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

type CloudLayer = Parameters<SetCloudLayer>[0];
// The game's own textures the cloud layer's program samples, by its slot (Login/Scene/Index.reference.ts, source
// `cloudLayerShader`), served from the extraction with the witness's exports: a reference the layer is drawn over to read
// What its settings can recover before textures of ours stand in for them, never shipped
const GAME_CLOUD_LAYER_TEXTURES: NonNullable<CloudLayer["textures"]> = {
  curl: `${WITNESS_PATH_PREFIX}Texture2D/Enviro_Clouds_Curl.png`,
  density: `${WITNESS_PATH_PREFIX}Texture2D/Enviro_Clouds_Voronoi.png`,
  normal: `${WITNESS_PATH_PREFIX}Texture2D/Enviro_Clouds_Normal.png`,
  wisps: `${WITNESS_PATH_PREFIX}Texture2D/Enviro_Clouds_Wispis.png`,
};
// A setting named this sets the sky's cloud coverage, and one prefixed so a cloud band's share by the band's name
const COVERAGE_SETTING = "coverage";
const BAND_SETTING_PREFIX = "cover.";
// Each solved setting's first step, a tenth of the shares most of them are
const SETTING_STEP = 0.1;
// A reference's sky drawn with the scene's cloud layer over the game's own textures, or told to over the ones the scene
// Synthesizes, at the settings given, read against
// The reference's as the atmosphere pass reads it (`readSkyComparison`): each setting a cloud layer's uniform by its
// Name (a number, or a vector's or a colour's components), `coverage` the sky's cloud coverage, or `cover.<band>` a
// Cloud band's share. The settings named are solved by the simplex from the values given, to the least sum of the
// Readings each over its gate and squared, and the frame at the settings handed back is written beside the reference with both skies' clouds (`writeCloudSheet`)
export const solveReferenceCloudLayer = async (
  referenceId: string,
  component: DerivedAssetComponent,
  settings: Record<string, number | number[]>,
  solvedNames: readonly string[],
  iterationCount: number,
  isOurTextures = false,
): Promise<{ measure: ParityPassMeasure; settings: Record<string, number | number[]> }> => {
  for (const name of solvedNames)
    if (typeof settings[name] !== "number")
      throw new InvalidOperationError(Operation.Read, name, "not a number among the settings given");
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, component, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      const { camera, compareShot, reference, referenceClouds, sky, spread } = await readSkyComparison(
        page,
        referenceId,
        component,
        { checkIsScored, height, image },
      );
      if (!isOurTextures)
        await page.evaluate(
          (textures) => (Reflect.get(window, "setSceneCloudLayer") as SetCloudLayer)({ textures }),
          GAME_CLOUD_LAYER_TEXTURES,
        );
      const shoot = async (drawn: Record<string, number | number[]>): Promise<Buffer> => {
        const entries = Object.entries(drawn);
        const covers = Object.fromEntries(
          entries.flatMap(([name, value]) =>
            name.startsWith(BAND_SETTING_PREFIX) && typeof value === "number"
              ? [[name.slice(BAND_SETTING_PREFIX.length), value]]
              : [],
          ),
        );
        const coverage = drawn[COVERAGE_SETTING];
        const layer: CloudLayer = {
          coverage: typeof coverage === "number" ? coverage : undefined,
          settings: Object.fromEntries(
            entries.filter(([name]) => name !== COVERAGE_SETTING && !name.startsWith(BAND_SETTING_PREFIX)),
          ),
        };
        await page.evaluate(
          async ([pageLayer, pageCovers]) => {
            await (Reflect.get(window, "setSceneCloudLayer") as SetCloudLayer)(pageLayer);
            (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)(pageCovers);
          },
          [layer, covers] as const,
        );
        await setPageWitnessView(page, { camera, families: [] });
        return page.screenshot();
      };
      const toSettings = (point: readonly number[]): Record<string, number | number[]> => ({
        ...settings,
        ...Object.fromEntries(solvedNames.map((name, index) => [name, point[index] ?? 0])),
      });
      const readMeasure = async (drawn: Record<string, number | number[]>) => {
        const shot = await shoot(drawn);
        const { clouds, distance, statistics } = await compareShot(shot);
        return { clouds, readings: toSkyReadings(referenceId, distance, spread), shot, statistics };
      };
      const { point } =
        solvedNames.length === 0
          ? { point: [] }
          : await minimizeNelderMead(
              async (candidate) => {
                const { readings } = await readMeasure(toSettings(candidate));
                return readings.reduce(
                  (sum, { gate, value }) => sum + (value / Math.max(gate, Number.EPSILON)) ** 2,
                  0,
                );
              },
              solvedNames.map((name) => settings[name] as number),
              solvedNames.map(() => SETTING_STEP),
              iterationCount,
            );
      const solved = toSettings(point);
      const { clouds, readings, shot, statistics } = await readMeasure(solved);
      await writeCloudSheet(`${referenceId}.layer`, {
        height,
        ourClouds: clouds,
        ourShot: shot,
        referenceClouds,
        referenceImage: image,
        sky,
      });
      return {
        measure: {
          notes: [
            `${referenceId}: ${sky.reduce((sum, isSky) => sum + isSky, 0)} pixels of sky; ${formatSkyComparison(statistics, reference)}`,
          ],
          readings,
        },
        settings: solved,
      };
    },
    () => browser.close(),
  );
};
