import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { AttributionRow } from "#src/models/genshinParity/AttributionRow";
import type { PageWitnessView } from "#src/services/genshinParity/setPageWitnessView";

import { COMPARISONS_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { openWitnessPages } from "#src/services/genshinParity/openWitnessPages";
import { scoreDetail } from "#src/services/genshinParity/scoreDetail";
import { scoreStructure } from "#src/services/genshinParity/scoreStructure";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A scene's loss table (apps/web/content/docs/proposals/genshin/scene-derivation.md): the witness drawing every family
// Of its parts from the exports, then the same with the exports' textures flattened to their mean colours, then each
// Family handed back to the scene's own kit in turn, then the scene's own parts alone. Each row is scored against every
// Reference, which share one pose, and averaged over them. With a camera, it is held for every row; without, the
// Scene's own camera stands. Each reference's rows are laid out one under another beside the comparisons
export const attributeScene = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
  camera?: PageWitnessView["camera"],
): Promise<AttributionRow[]> => {
  const pages = await openWitnessPages(referenceIds, witness);
  return withFinalizerAsync(
    async () => {
      const familyList = (await pages[0]?.page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",").filter(Boolean);
      const views: { name: string; view: PageWitnessView }[] = [
        { name: "witness", view: { camera, families } },
        { name: "witness, textures flattened", view: { camera, families, shading: "Flat" } },
        ...families.map((family) => ({
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
          pages.map(async ({ height, image, page, referenceId, scoreLines }) => {
            await setPageWitnessView(page, view);
            const screenshot = await page.screenshot();
            const shot = await sharp(screenshot).resize(STRUCTURE_WIDTH, height).png().toBuffer();
            referenceShotsMap.set(referenceId, [...(referenceShotsMap.get(referenceId) ?? []), shot]);
            const [lineDistance, { edgeScore, toneDifference }, detail] = await Promise.all([
              scoreLines(shot),
              scoreStructure(image, shot),
              scoreDetail(image, shot),
            ]);
            return { detail, lineDistance, shape: edgeScore, tone: toneDifference };
          }),
        );
        const readMean = (key: Exclude<keyof AttributionRow, "name">): number =>
          scores.reduce((sum, score) => sum + score[key], 0) / scores.length;
        rows.push({
          detail: readMean("detail"),
          lineDistance: readMean("lineDistance"),
          name,
          shape: readMean("shape"),
          tone: readMean("tone"),
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
