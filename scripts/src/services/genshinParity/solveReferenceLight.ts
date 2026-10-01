import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

type Vector = [number, number, number];
const BYTE = 255;
// The cosine past which a part's face counts as lit by the sun, and under which it counts as turned away, leaving the
// Grazing faces between, which neither light alone explains, out of both
const LIT_COSINE = 0.15;
const SHADE_COSINE = -0.05;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const readLuminance = (data: Buffer, pixel: number): number =>
  0.2126 * toLinear((data[pixel * 3] ?? 0) / BYTE) +
  0.7152 * toLinear((data[pixel * 3 + 1] ?? 0) / BYTE) +
  0.0722 * toLinear((data[pixel * 3 + 2] ?? 0) / BYTE);
const readMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
type SetLights = (shares: { ambientShare?: number; sunShare?: number }) => { direction: Vector };
const setLights = (page: Page, shares: { ambientShare?: number; sunShare?: number }): Promise<{ direction: Vector }> =>
  page.evaluate((lightShares) => (Reflect.get(window, "setSceneLights") as SetLights)(lightShares), shares);
// How strong the scene's sun and its sky's ambient light should stand at a reference's hour, as shares of what the
// Scene sets: over the faces of the parts the witness draws, those the sun lights and those turned from it, the median
// Luminance of each set in the reference against our scene drawn under the sun alone and the sky alone, two equations
// In the two shares, solved. One factor for both, as `exposure` reads, matches a part's middle brightness and flattens
// It, the sky's light swamping the sun's direction; the two apart keep its lit faces bright and its shaded ones dark
export const solveReferenceLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ ambientShare: number; litCount: number; shadeCount: number; sunShare: number }> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { direction } = await setLights(page, {});
      await setPageWitnessView(page, {});
      const {
        targets: { normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Normal, WitnessTargetName.Part]);
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const shoot = async (shares: { ambientShare: number; sunShare: number }): Promise<Buffer> => {
        await setLights(page, shares);
        await setPageWitnessView(page, { families: [] });
        return sharp(await page.screenshot())
          .resize(width, height, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer();
      };
      const sunOnly = await shoot({ ambientShare: 0, sunShare: 1 });
      const skyOnly = await shoot({ ambientShare: 1, sunShare: 0 });
      await setLights(page, { ambientShare: 1, sunShare: 1 });
      const lit: number[] = [];
      const shade: number[] = [];
      for (let pixel = 0; pixel < width * height; pixel++) {
        if (!part[pixel * 4]) continue;
        const cosine =
          (normal[pixel * 4] ?? 0) * direction[0] +
          (normal[pixel * 4 + 1] ?? 0) * direction[1] +
          (normal[pixel * 4 + 2] ?? 0) * direction[2];
        if (cosine > LIT_COSINE) lit.push(pixel);
        else if (cosine < SHADE_COSINE) shade.push(pixel);
      }
      const readSet = (data: Buffer, pixels: readonly number[]): number =>
        readMedian(pixels.map((pixel) => readLuminance(data, pixel)));
      const shares = solveLinearSystem(
        [
          [readSet(sunOnly, lit), readSet(skyOnly, lit)],
          [readSet(sunOnly, shade), readSet(skyOnly, shade)],
        ],
        [readSet(reference, lit), readSet(reference, shade)],
      ) ?? [1, 1];
      const [sunShare = 1, ambientShare = 1] = shares;
      return { ambientShare, litCount: lit.length, shadeCount: shade.length, sunShare };
    },
    () => browser.close(),
  );
};
