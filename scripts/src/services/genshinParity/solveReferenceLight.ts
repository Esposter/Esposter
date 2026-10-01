import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";
import { checkIsPartInterior } from "#src/services/genshinParity/checkIsPartInterior";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";
import { solveSunDirection } from "#src/services/genshinParity/solveSunDirection";
import { withFinalizerAsync } from "@esposter/shared";
import sharp from "sharp";

type Vector = [number, number, number];
const BYTE = 255;
// The faces read: those facing up, whose normal's height is past the first, lit by the sky overhead and by the sun at
// Whatever height it stands, and the upright ones, their normal's height within the second either side of level, turned
// From the sun past the third, lit by the sky alone. The two differ in how much of each light they take, which is
// What lets the two be told apart, and a low sun lights an upright face it faces about as much as the sky does
const UP_NORMAL_HEIGHT = 0.8;
const UPRIGHT_NORMAL_HEIGHT = 0.3;
const SHADE_COSINE = -0.1;
// The depth within which a part's pixels are read, where the reference's haze is thin enough to leave its light, since
// Ours is drawn without its fog so that the two lights alone are what it holds
const NEAR_DEPTH = 20;
// The depth within which the sun's direction is read, past which the haze levels what its light shows
const DIRECTION_DEPTH = 60;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const CHANNELS = [0, 1, 2] as const;
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
const readMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
type SetLights = (shares: { ambientShare?: number; sunShare?: number }) => { direction: Vector };
const setLights = (page: Page, shares: { ambientShare?: number; sunShare?: number }): Promise<{ direction: Vector }> =>
  page.evaluate((lightShares) => (Reflect.get(window, "setSceneLights") as SetLights)(lightShares), shares);
// How strong the scene's sun and its sky's ambient light should stand at a reference's hour, as shares of what the
// Scene sets: over the near faces of the parts the witness draws, those facing up and the upright ones turned from the
// Sun, the median
// Of each channel over each set in the reference against our scene drawn under the sun alone and the sky alone, two
// Equations a channel in the two shares, solved channel by channel, so each light's colour is solved with its strength.
// One factor for both, as `exposure` reads, matches a part's middle brightness and flattens it, the sky's light
// Swamping the sun's direction; the two apart keep its lit faces bright and its shaded ones dark, and their colours
// Keep a shaded face the sky's hue where one factor would tint it with the sun's. The sun's direction is solved
// First and apart, from the reference alone (`solveSunDirection`), over the parts near enough that the haze leaves
// Their light; the shares are read under the direction the scene already sets
export const solveReferenceLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  ambientShare: Vector;
  litCount: number;
  shadeCount: number;
  sun: ReturnType<typeof solveSunDirection>;
  sunShare: Vector;
}> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { direction } = await setLights(page, {});
      await setPageWitnessView(page, {});
      const {
        targets: { depth = new Float32Array(), normal = new Float32Array(), part = new Float32Array() },
        width,
      } = await readWitnessTargets(page, [WitnessTargetName.Depth, WitnessTargetName.Normal, WitnessTargetName.Part]);
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const directionSamples: Parameters<typeof solveSunDirection>[0][number][] = [];
      for (let pixel = 0; pixel < width * height; pixel++)
        if ((depth[pixel * 4] ?? 0) < DIRECTION_DEPTH && checkIsPartInterior(part, width, height, pixel))
          directionSamples.push({
            brightness: CHANNELS.reduce(
              (sum: number, channel) =>
                sum + toLinear((reference[pixel * 3 + channel] ?? 0) / BYTE) * LUMINANCE[channel],
              0,
            ),
            normal: [normal[pixel * 4] ?? 0, normal[pixel * 4 + 1] ?? 0, normal[pixel * 4 + 2] ?? 0],
          });
      const sun = solveSunDirection(directionSamples);
      const shoot = async (shares: { ambientShare: number; sunShare: number }): Promise<Buffer> => {
        await setLights(page, shares);
        await setPageWitnessView(page, { isAlone: true });
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
        if ((depth[pixel * 4] ?? 0) > NEAR_DEPTH || !checkIsPartInterior(part, width, height, pixel)) continue;
        const cosine =
          (normal[pixel * 4] ?? 0) * direction[0] +
          (normal[pixel * 4 + 1] ?? 0) * direction[1] +
          (normal[pixel * 4 + 2] ?? 0) * direction[2];
        const normalHeight = normal[pixel * 4 + 1] ?? 0;
        if (normalHeight > UP_NORMAL_HEIGHT) lit.push(pixel);
        else if (Math.abs(normalHeight) < UPRIGHT_NORMAL_HEIGHT && cosine < SHADE_COSINE) shade.push(pixel);
      }
      const readSet = (data: Buffer, pixels: readonly number[], channel: number): number =>
        readMedian(pixels.map((pixel) => toLinear((data[pixel * 3 + channel] ?? 0) / BYTE)));
      const shares = CHANNELS.map(
        (channel) =>
          solveLinearSystem(
            [
              [readSet(sunOnly, lit, channel), readSet(skyOnly, lit, channel)],
              [readSet(sunOnly, shade, channel), readSet(skyOnly, shade, channel)],
            ],
            [readSet(reference, lit, channel), readSet(reference, shade, channel)],
          ) ?? [1, 1],
      );
      return {
        ambientShare: CHANNELS.map((channel) => shares[channel]?.[1] ?? 1) as Vector,
        litCount: lit.length,
        shadeCount: shade.length,
        sun,
        sunShare: CHANNELS.map((channel) => shares[channel]?.[0] ?? 1) as Vector,
      };
    },
    () => browser.close(),
  );
};
