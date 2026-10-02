import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

const BYTE = 255;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const readLuminance = (data: Buffer, pixel: number): number =>
  0.2126 * toLinear((data[pixel * 3] ?? 0) / BYTE) +
  0.7152 * toLinear((data[pixel * 3 + 1] ?? 0) / BYTE) +
  0.0722 * toLinear((data[pixel * 3 + 2] ?? 0) / BYTE);
const readMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
// How much brighter a reference's parts stand than ours, as one factor: over the pixels the witness's parts cover, the
// Median of the reference's linear luminance over the median of our own scene's at the same view, our parts drawn. The
// Light the scene casts at the reference's hour scales by it, the one unknown a lit part's brightness separates from
// The others: its colours, the fog and the grade stay as they are
export const readReferenceExposure = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ ours: number; ratio: number; reference: number }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const { part, width } = await readWitnessPartTarget(page);
      await setPageWitnessView(page, { families: [] });
      const ours = await sharp(await page.screenshot())
        .resize(width, height, { fit: "fill" })
        .removeAlpha()
        .raw()
        .toBuffer();
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const covered = Array.from({ length: width * height }, (_, pixel) => pixel).filter(
        (pixel) => part[pixel * 4] && checkIsScored(pixel, width),
      );
      const referenceLuminance = readMedian(covered.map((pixel) => readLuminance(reference, pixel)));
      const ourLuminance = readMedian(covered.map((pixel) => readLuminance(ours, pixel)));
      return {
        ours: ourLuminance,
        ratio: referenceLuminance / Math.max(ourLuminance, Number.EPSILON),
        reference: referenceLuminance,
      };
    },
    () => browser.close(),
  );
};
