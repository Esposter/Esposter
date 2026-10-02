import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { COMPARISONS_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readFlipErrorMap } from "#src/services/genshinParity/readFlipErrorMap";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { scoreLabelSimilarity } from "#src/services/genshinParity/scoreLabelSimilarity";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { shootWitnessFamilies } from "#src/services/genshinParity/shootWitnessFamilies";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const readGrey = async (input: Buffer, width: number, height: number): Promise<Float32Array> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (value) => value / 255);
};
// Wide enough that a tower's windows, its gold bands and the door's relief span several pixels
const STAND_IN_WIDTH = 960;
// Each family's stand-in against the game's own exports, both drawn by the one page at the reference's camera, moment,
// Light and haze: FLIP between the two over the exports' pixels of the family. A recording is soft, its light is ours
// To match and its parts never line up to the pixel, so a stand-in missing its windows, trims and carving scores
// Within noise of the exports against it; drawn beside the exports, every pixel lines up and only the stand-in differs.
// Each family's mean, its ceiling as a share of the frame's pixels the same way rank's are, and its structural
// Similarity to the exports, which charges detail a few pixels off once where FLIP charges it twice. The two frames are
// Written one over the other, the exports on top, for the eye
export const readStandInGains = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ ceiling: number; mean: number; name: string; share: number; similarity: number }[]> => {
  await fetchReferences();
  const { browser, checkIsScored, height, page } = await openWitnessPage(referenceId, witness, STAND_IN_WIDTH);
  return withFinalizerAsync(
    async () => {
      const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",").filter(Boolean);
      await setPageWitnessView(page, { families });
      const { families: layerFamilies, part, width } = await readWitnessPartTarget(page);
      const size = { height, width };
      const exportsShot = await shootWitnessFamilies(page, families, size);
      const ourShot = await shootWitnessFamilies(page, [], size);
      const sheet = await sharp({ create: { background: "#000", channels: 3, height: height * 2, width } })
        .composite([
          { input: exportsShot, left: 0, top: 0 },
          { input: ourShot, left: 0, top: height },
        ])
        .png()
        .toBuffer();
      await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
      await writeFile(join(COMPARISONS_DIRECTORY, `${referenceId}.stand-in.png`), sheet);
      const { errorMap } = await readFlipErrorMap(exportsShot, ourShot, width, height);
      const labels = Int32Array.from(errorMap, (_, pixel) =>
        checkIsScored(pixel, width) && part[pixel * 4] ? (part[pixel * 4 + 1] ?? 0) : -1,
      );
      const [exportsGrey, ourGrey] = await Promise.all([
        readGrey(exportsShot, width, height),
        readGrey(ourShot, width, height),
      ]);
      const similarities = scoreLabelSimilarity(exportsGrey, ourGrey, width, height, labels, layerFamilies.length);
      const terms = new Map<string, { count: number; error: number; similarity: number }>();
      let scoredCount = 0;
      for (const [pixel, error] of errorMap.entries()) {
        if (!checkIsScored(pixel, width)) continue;
        scoredCount++;
        if (!part[pixel * 4]) continue;
        const family = part[pixel * 4 + 1] ?? 0;
        const name = layerFamilies[family] ?? "unnamed";
        const term = terms.get(name) ?? { count: 0, error: 0, similarity: similarities[family] ?? 0 };
        term.count++;
        term.error += error;
        terms.set(name, term);
      }
      return Array.from(terms, ([name, { count, error, similarity }]) => ({
        ceiling: error / Math.max(scoredCount, 1),
        mean: error / Math.max(count, 1),
        name,
        share: count / Math.max(scoredCount, 1),
        similarity,
      })).toSorted((first, second) => second.ceiling - first.ceiling);
    },
    () => browser.close(),
  );
};
