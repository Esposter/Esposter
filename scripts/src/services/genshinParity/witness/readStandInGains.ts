import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { COMPARISONS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readFlipErrorMap } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { readWitnessFamilies } from "#src/services/genshinParity/shared/readWitnessFamilies";
import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { scoreLabelSimilarity } from "#src/services/genshinParity/witness/scoreLabelSimilarity";
import { shootWitnessFamilies } from "#src/services/genshinParity/witness/shootWitnessFamilies";
import { BYTE } from "#src/services/shared/constants";
import { getOrCreate, withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const readGrey = async (input: Buffer, width: number, height: number): Promise<Float32Array> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (value) => value / BYTE);
};
// Wide enough that a tower's windows, its gold bands and the door's relief span several pixels
const STAND_IN_WIDTH = 960;
// Each family's stand-in against the game's own exports, both drawn by the one page at the reference's camera, moment,
// Light and haze: FLIP between the two over the exports' pixels of the family, where every pixel lines up and only the
// Stand-in differs. It chooses between representations of a stand-in rank's own table already ranks and orders
// Nothing: its gap is the stand-in's distance from its exports, not what the frame would recover, which under a light
// Far from the game's is near nothing however wide the gap. Each family's mean, its gap as a share of the frame's
// Pixels as rank's ceilings are, and its structural similarity to the exports, which charges detail a few pixels off
// Once where FLIP charges it twice. The two frames are written one over the other, the exports on top, for the eye
export const readStandInGains = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ gap: number; mean: number; name: string; share: number; similarity: number }[]> => {
  await fetchReferences();
  const { browser, checkIsScored, height, page } = await openWitnessPage(referenceId, witness, STAND_IN_WIDTH);
  return withFinalizerAsync(
    async () => {
      const families = await readWitnessFamilies(page);
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
      const nameTermMap = new Map<string, { count: number; error: number; similarity: number }>();
      let scoredCount = 0;
      for (const [pixel, error] of errorMap.entries()) {
        if (!checkIsScored(pixel, width)) continue;
        scoredCount++;
        if (!part[pixel * 4]) continue;
        const family = part[pixel * 4 + 1] ?? 0;
        const name = layerFamilies[family] ?? "unnamed";
        const term = getOrCreate(nameTermMap, name, () => ({
          count: 0,
          error: 0,
          similarity: similarities[family] ?? 0,
        }));
        term.count++;
        term.error += error;
      }
      return Array.from(nameTermMap, ([name, { count, error, similarity }]) => ({
        gap: error / Math.max(scoredCount, 1),
        mean: error / Math.max(count, 1),
        name,
        share: count / Math.max(scoredCount, 1),
        similarity,
      })).toSorted((first, second) => second.gap - first.gap);
    },
    () => browser.close(),
  );
};
