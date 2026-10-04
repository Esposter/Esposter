import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetCloudColors } from "#src/models/genshinParity/sky/SetCloudColors";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { CHANNELS, CLOUD_BRIGHTNESS_RATIO } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { getLuminance } from "#src/services/genshinParity/sky/getLuminance";
import { getPixelSceneColor } from "#src/services/genshinParity/sky/getPixelSceneColor";
import { solveCloudColors } from "#src/services/genshinParity/sky/solveCloudColors";
import { withFinalizerAsync } from "@esposter/shared";
import { toneMapNeutral } from "genshin-engine";
import sharp from "sharp";
import { Color, Matrix4, Vector3, Vector4 } from "three";

// Every this many pixels across and down is a sample: the clouds' colours change slowly, and both sets keep thousands
const SAMPLE_STRIDE = 4;
// A pixel of ours is a cloud where its shares of the clouds' two colours add to at least this, so the sky behind a
// Cloud's soft edge does not stand for it
const MIN_CLOUD_COVER = 0.3;
const toDisplayHex = ([red, green, blue]: Vector): string =>
  `#${new Color(...toneMapNeutral([Math.max(red, 0), Math.max(green, 0), Math.max(blue, 0)])).getHexString()}`;
const setCloudColors = (page: Page, colors?: { lit: Vector; shade: Vector }): Promise<void> =>
  page.evaluate((cloudColors) => {
    (Reflect.get(window, "setSceneCloudColors") as SetCloudColors)(cloudColors);
  }, colors);
// A reference's cloud colours solved over its sky above the horizon, where ours and the reference's clouds stand in
// Different places: ours drawn with the clouds black, then their shaded colour white, then their lit colour white, so
// Each pixel's sky behind and its shares of the two colours are read apart in the scene's own colour, and ours without
// Clouds, against which a reference pixel that many times as bright is one of its clouds. The two sets of clouds are
// Matched by their colours' spread (`solveCloudColors`), each pixel read once in a few across and down
export const solveReferenceClouds = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ lit: string; ourCount: number; referenceCount: number; residual: number; shade: string }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const { part, width } = await readWitnessPartTarget(page);
      const sky = await page.evaluate(() =>
        (Reflect.get(window, "getSceneSky") as () => { matrixWorld: number[]; projectionMatrixInverse: number[] })(),
      );
      const shoot = async (colors?: { lit: Vector; shade: Vector }, isAlone = false): Promise<Buffer> => {
        await setCloudColors(page, colors);
        await setPageWitnessView(page, { isAlone });
        return sharp(await page.screenshot())
          .resize(width, height, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer();
      };
      const black: Vector = [0, 0, 0];
      const white: Vector = [1, 1, 1];
      const baseShot = await shoot({ lit: black, shade: black });
      const shadeShot = await shoot({ lit: black, shade: white });
      const litShot = await shoot({ lit: white, shade: black });
      const clearShot = await shoot(undefined, true);
      await setCloudColors(page);
      await setPageWitnessView(page, {});
      const reference = await sharp(image).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const projectionInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const world = new Matrix4().fromArray(sky.matrixWorld);
      const ours: { base: Vector; lit: Vector; shade: Vector }[] = [];
      const referenceClouds: Vector[] = [];
      for (let row = 0; row < height; row += SAMPLE_STRIDE)
        for (let column = 0; column < width; column += SAMPLE_STRIDE) {
          const pixel = row * width + column;
          if (part[pixel * 4] || !checkIsScored(pixel, width)) continue;
          const view = new Vector4(
            ((column + 0.5) / width) * 2 - 1,
            1 - ((row + 0.5) / height) * 2,
            0.5,
            1,
          ).applyMatrix4(projectionInverse);
          const direction = new Vector3(view.x / view.w, view.y / view.w, view.z / view.w).transformDirection(world);
          if (direction.y <= 0) continue;
          const base = getPixelSceneColor(baseShot, pixel);
          const shadeColor = getPixelSceneColor(shadeShot, pixel);
          const litColor = getPixelSceneColor(litShot, pixel);
          const shade = CHANNELS.map((channel) => shadeColor[channel] - base[channel]) as Vector;
          const lit = CHANNELS.map((channel) => litColor[channel] - base[channel]) as Vector;
          if (getLuminance(shade) + getLuminance(lit) >= MIN_CLOUD_COVER) ours.push({ base, lit, shade });
          const referenceColor = getPixelSceneColor(reference, pixel);
          if (
            getLuminance(referenceColor) >
            getLuminance(getPixelSceneColor(clearShot, pixel)) * CLOUD_BRIGHTNESS_RATIO
          )
            referenceClouds.push(referenceColor);
        }
      const { lit, residual, shade } = solveCloudColors(ours, referenceClouds);
      return {
        lit: toDisplayHex(lit),
        ourCount: ours.length,
        referenceCount: referenceClouds.length,
        residual,
        shade: toDisplayHex(shade),
      };
    },
    () => browser.close(),
  );
};
