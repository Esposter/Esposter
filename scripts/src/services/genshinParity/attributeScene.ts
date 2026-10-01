import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { AttributionRow } from "#src/models/genshinParity/AttributionRow";
import type { LayerScore } from "#src/models/genshinParity/LayerScore";
import type { PageWitnessView } from "#src/services/genshinParity/setPageWitnessView";

import { COMPARISONS_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { scoreLayers } from "#src/services/genshinParity/scoreLayers";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const readMean = (layer: readonly LayerScore[], key: Exclude<keyof LayerScore, "name">): number =>
  layer.reduce((sum, score) => sum + score[key], 0) / layer.length;
// A scene's loss table (apps/web/content/docs/proposals/genshin/scene-derivation.md): the witness drawing every family
// Of its parts from the exports, then the same with the exports' textures flattened to their mean colours, then each
// Family handed back to the scene's own kit in turn, then the scene's own parts alone. Each row is scored layer by layer
// Against every reference, which share one pose, the layers the witness's part target gives at that pose, and averaged
// Over them. With a camera, it is held for every row; without, the scene's own camera stands. Each reference's rows
// Are laid out one under another beside the comparisons
export const attributeScene = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
  camera?: PageWitnessView["camera"],
): Promise<AttributionRow[]> => {
  await fetchReferences();
  const pages = await Promise.all(
    referenceIds.map(async (referenceId) => ({ referenceId, ...(await openWitnessPage(referenceId, witness)) })),
  );
  return withFinalizerAsync(
    async () => {
      const familyList = (await pages[0]?.page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",");
      // Each reference's layers from the exports at the pose, before any family is handed back
      const gbuffers = await Promise.all(
        pages.map(async ({ page }) => {
          await setPageWitnessView(page, { camera, families });
          return readWitnessGbuffer(page);
        }),
      );
      const views: { name: string; view: PageWitnessView }[] = [
        { name: "witness", view: { camera, families } },
        { name: "witness, textures flattened", view: { camera, families, shading: "Flat" } },
        ...families
          .filter(Boolean)
          .map((family) => ({
            name: `ours: ${family}`,
            view: { camera, families: families.filter((drawn) => drawn !== family) },
          })),
        { name: "ours", view: { camera, families: [] } },
      ];
      const rows: AttributionRow[] = [];
      const referenceShotsMap = new Map<string, Buffer[]>();
      for (const { name, view } of views) {
        // oxlint-disable-next-line no-await-in-loop -- each page draws one view at a time
        const scores = await Promise.all(
          pages.map(async ({ height, image, page, referenceId }, index) => {
            await setPageWitnessView(page, view);
            const shot = await sharp(await page.screenshot())
              .resize(STRUCTURE_WIDTH, height)
              .png()
              .toBuffer();
            referenceShotsMap.set(referenceId, [...(referenceShotsMap.get(referenceId) ?? []), shot]);
            const gbuffer = gbuffers[index];
            return gbuffer ? scoreLayers(image, shot, gbuffer) : [];
          }),
        );
        // Each layer averaged over the references that hold it
        const layerScoresMap = Map.groupBy(scores.flat(), (score) => score.name);
        rows.push({
          layers: Array.from(layerScoresMap, ([layerName, layer]) => ({
            coverage: readMean(layer, "coverage"),
            detail: readMean(layer, "detail"),
            flip: readMean(layer, "flip"),
            name: layerName,
            shape: readMean(layer, "shape"),
            tone: readMean(layer, "tone"),
          })),
          name,
        });
      }
      await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
      for (const { height, image, referenceId } of pages) {
        const tiles = [image, ...(referenceShotsMap.get(referenceId) ?? [])];
        // oxlint-disable-next-line no-await-in-loop -- one reference's sheet at a time
        const sheet = await sharp({
          create: { background: "#000", channels: 3, height: height * tiles.length, width: STRUCTURE_WIDTH },
        })
          .composite(tiles.map((input, index) => ({ input, left: 0, top: index * height })))
          .png()
          .toBuffer();
        // oxlint-disable-next-line no-await-in-loop -- as above
        await writeFile(join(COMPARISONS_DIRECTORY, `${referenceId}.attribution.png`), sheet);
      }
      return rows;
    },
    async () => {
      await Promise.all(pages.map(({ browser }) => browser.close()));
    },
  );
};
