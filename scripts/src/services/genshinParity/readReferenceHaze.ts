import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";
import { checkIsPartInterior } from "#src/services/genshinParity/checkIsPartInterior";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

type Vector = [number, number, number];
const BYTE = 255;
const CHANNELS = [0, 1, 2] as const;
// The depths the parts' pixels are banded by, in metres, each band from one to the next
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640];
// The fewest pixels a band is read from
const MIN_BAND_COUNT = 200;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const readMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
// How a reference's parts fade with their distance against ours: the parts' interior pixels the witness draws, banded by their
// Depth, each band's median linear colour in the reference beside ours drawn without its fog and with it. Where ours
// Without fog already stands with the reference, our fog only washes it; where ours with fog stands paler than the
// Reference, the fog is too thick at that depth, and the band it starts to part from the reference at is where
export const readReferenceHaze = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ clear: Vector; count: number; far: number; hazed: Vector; near: number; reference: Vector }[]> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const {
        targets: { depth = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Depth, WitnessTargetName.Part]);
      const shoot = async (isAlone: boolean): Promise<Buffer> => {
        await setPageWitnessView(page, { isAlone });
        return sharp(await page.screenshot())
          .resize(width, height, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer();
      };
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const clear = await shoot(true);
      const hazed = await shoot(false);
      return DEPTH_BANDS.slice(1).flatMap((far, index) => {
        const near = DEPTH_BANDS[index] ?? 0;
        const pixels: number[] = [];
        for (let pixel = 0; pixel < width * height; pixel++) {
          const pixelDepth = depth[pixel * 4] ?? 0;
          if (pixelDepth >= near && pixelDepth < far && checkIsPartInterior(part, width, height, pixel))
            pixels.push(pixel);
        }
        if (pixels.length < MIN_BAND_COUNT) return [];
        const readBand = (data: Buffer): Vector =>
          CHANNELS.map((channel) =>
            readMedian(pixels.map((pixel) => toLinear((data[pixel * 3 + channel] ?? 0) / BYTE))),
          ) as Vector;
        return [
          {
            clear: readBand(clear),
            count: pixels.length,
            far,
            hazed: readBand(hazed),
            near,
            reference: readBand(reference),
          },
        ];
      });
    },
    () => browser.close(),
  );
};
