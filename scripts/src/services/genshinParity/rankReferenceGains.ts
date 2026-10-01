import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { REFERENCES_DIRECTORY, SKY_LAYER } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { readFlipErrorMap } from "#src/services/genshinParity/readFlipErrorMap";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// The depths a part's pixels are split by, near, middle and far, where the light, then the haze, decides their colour
const DEPTH_BANDS: [string, number][] = [
  ["near", 20],
  ["middle", 80],
  ["far", Infinity],
];
// The sky's rows split into this many bands from the frame's top down, the zenith apart from the horizon's glow
const SKY_BAND_COUNT = 3;
// Every term of a reference's error ranked by its ceiling, the most of the frame's FLIP that term drawn exactly would
// Recover: the frame's FLIP is its pixels' mean, so a term's ceiling is its pixels' error summed over the frame's
// Pixels. Each family of parts the witness draws splits into its stand-in, the error ours carries over the game's own
// Exports on that family's pixels, and the shared terms the exports carry too (the light, the haze, the grade), split
// By depth; the sky splits by its rows. One page draws the witness's layers and two shots, ours and the exports', and
// The error is mapped once over each, inside the reference's scored region
export const rankReferenceGains = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ frame: number; terms: { ceiling: number; name: string; share: number }[] }> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",").filter(Boolean);
      await setPageWitnessView(page, { families });
      const { depth, families: layerFamilies, part, width } = await readWitnessGbuffer(page);
      const shoot = async (drawn: string[]): Promise<Buffer> => {
        await setPageWitnessView(page, { families: drawn });
        return sharp(await page.screenshot())
          .resize(width, height, { fit: "fill" })
          .png()
          .toBuffer();
      };
      const [{ errorMap: witnessErrors }, { errorMap: ourErrors }] = [
        await readFlipErrorMap(image, await shoot(families), width, height),
        await readFlipErrorMap(image, await shoot([]), width, height),
      ];
      // The reference's scored region, in the drawn frame's pixels
      const { region } = ParityReferenceMap[referenceId] ?? {};
      const { width: referenceWidth } = await sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`)).metadata();
      const scale = width / referenceWidth;
      const checkIsScored = (pixel: number): boolean => {
        if (!region) return true;
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        return (
          column >= region.x * scale &&
          column < (region.x + region.width) * scale &&
          row >= region.y * scale &&
          row < (region.y + region.height) * scale
        );
      };
      const termMap = new Map<string, { count: number; error: number }>();
      const add = (name: string, error: number): void => {
        const term = termMap.get(name) ?? { count: 0, error: 0 };
        term.count++;
        term.error += error;
        termMap.set(name, term);
      };
      let scoredCount = 0;
      let frameError = 0;
      for (let pixel = 0; pixel < width * height; pixel++) {
        if (!checkIsScored(pixel)) continue;
        scoredCount++;
        const ourError = ourErrors[pixel] ?? 0;
        frameError += ourError;
        if (part[pixel * 4] === 0) {
          const band = Math.min(Math.floor((Math.floor(pixel / width) / height) * SKY_BAND_COUNT), SKY_BAND_COUNT - 1);
          add(`${SKY_LAYER}, band ${band + 1} of ${SKY_BAND_COUNT} from the top`, ourError);
          continue;
        }
        const family = layerFamilies[part[pixel * 4 + 1] ?? 0] ?? "unnamed";
        const witnessError = witnessErrors[pixel] ?? 0;
        add(`${family}: stand-in`, ourError - witnessError);
        const [band = "far"] = DEPTH_BANDS.find(([, far]) => (depth[pixel * 4] ?? 0) < far) ?? [];
        add(`${family}: light, haze and grade, ${band}`, witnessError);
      }
      return {
        frame: frameError / Math.max(scoredCount, 1),
        terms: Array.from(termMap, ([name, { count, error }]) => ({
          ceiling: error / Math.max(scoredCount, 1),
          name,
          share: count / Math.max(scoredCount, 1),
        })).toSorted((first, second) => second.ceiling - first.ceiling),
      };
    },
    () => browser.close(),
  );
};
