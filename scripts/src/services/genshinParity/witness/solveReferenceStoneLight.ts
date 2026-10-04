import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetLights } from "#src/models/genshinParity/witness/SetLights";
import type { SceneFog } from "#src/models/genshinParity/sky/SceneFog";
import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { getPixelSceneColor } from "#src/services/genshinParity/sky/getPixelSceneColor";
import { shootWitnessFamilies } from "#src/services/genshinParity/witness/shootWitnessFamilies";
import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";
import { withFinalizerAsync } from "@esposter/shared";
import { computeStoneHarmonics, computeStoneRampCoordinate, STONE_HARMONIC_COUNT } from "genshin-engine";
import sharp from "sharp";
import { Matrix4, Vector3 } from "three";

// A pixel's bin: its depth band, in metres between one and the next, its ramp coordinate in this many steps, and how
// Far its face turns up in this many, so each bin holds faces the light and the haze treat alike
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640, Infinity];
const RAMP_BIN_COUNT = 12;
const UPWARD_BIN_COUNT = 4;
const readPage = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
// A reference's stone light solved as the game's deferred pass casts it, over the parts the witness draws from the
// Game's exports: each part's interior pixel, its reference colour taken back into scene colour (`toSceneColor`), the
// Exports' albedo, their normal against the scene's sun and the sun's visibility there giving its ramp coordinate and
// Its harmonics, and the scene's own haze giving its opacity and its colours. The light is a linear solve over the bins
// (`solveStoneLight`) under the scene's own haze: its density refined with the light runs to a haze so thick the
// Light's terms barely reach the screen and swing apart for the hundredth of residual it saves
export const solveReferenceStoneLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSelf = false,
): Promise<{ count: number; deviation: number; light: StoneLight; residual: number }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, {});
      const {
        targets: {
          albedo = new Float32Array(),
          depth = new Float32Array(),
          emission = new Float32Array(),
          normal = new Float32Array(),
          part = new Float32Array(),
          shadow = new Float32Array(),
        },
        width,
      } = await readWitnessTargets(page, [
        WitnessTargetName.Albedo,
        WitnessTargetName.Depth,
        WitnessTargetName.Emission,
        WitnessTargetName.Normal,
        WitnessTargetName.Part,
        WitnessTargetName.Shadow,
      ]);
      const sky = await readPage<{ matrixWorld: number[]; projectionMatrixInverse: number[] }>(page, "getSceneSky");
      const fog = await readPage<SceneFog>(page, "getSceneFog");
      const { direction } = await page.evaluate(() => (Reflect.get(window, "setSceneLights") as SetLights)({}));
      // Solved against the exports as the scene draws them under its own light, the solve should hand that light back,
      // Which checks its model against the renderer before it is trusted on a reference
      const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const source = isSelf
        ? await shootWitnessFamilies(page, familyList.split(",").filter(Boolean), { height, width })
        : image;
      await setPageWitnessView(page, {});
      const referenceShot = await sharp(source).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const matrixWorld = new Matrix4().fromArray(sky.matrixWorld);
      const projectionMatrixInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const eye = new Vector3().setFromMatrixPosition(matrixWorld);
      const sun = new Vector3(...direction).normalize();
      const scatterDirection = new Vector3(...fog.scatterDirection).normalize();
      const pixels: { point: Vector; sample: Omit<StoneLightSample, "opacity"> }[] = [];
      for (let pixel = 0; pixel < width * height; pixel++) {
        if (!checkIsPartInterior(part, width, height, pixel) || !checkIsScored(pixel, width)) continue;
        // The pixel's ray in the view, scaled to the depth along the view the witness wrote
        const [column, row] = [pixel % width, Math.floor(pixel / width)];
        const view = new Vector3(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5).applyMatrix4(
          projectionMatrixInverse,
        );
        const pixelDepth = depth[pixel * 4] ?? 0;
        const point = view.multiplyScalar(pixelDepth / -view.z).applyMatrix4(matrixWorld);
        const faceNormal = new Vector3(
          normal[pixel * 4] ?? 0,
          normal[pixel * 4 + 1] ?? 0,
          normal[pixel * 4 + 2] ?? 0,
        ).normalize();
        const harmonics = Array.from({ length: STONE_HARMONIC_COUNT }, () => 0);
        computeStoneHarmonics(faceNormal.toArray(), harmonics);
        const rampCoordinate = computeStoneRampCoordinate(faceNormal.dot(sun), shadow[pixel * 4] ?? 0);
        const ray = point.clone().sub(eye).normalize();
        const scatter = Math.min(Math.max(ray.dot(scatterDirection), 0) ** fog.scatterPower * fog.scatterStrength, 1);
        const band = DEPTH_BANDS.findIndex((far) => pixelDepth < far);
        const rampBin = Math.min(Math.floor(rampCoordinate * RAMP_BIN_COUNT), RAMP_BIN_COUNT - 1);
        const upwardBin = Math.min(Math.floor(((faceNormal.y + 1) / 2) * UPWARD_BIN_COUNT), UPWARD_BIN_COUNT - 1);
        pixels.push({
          point: point.toArray(),
          sample: {
            albedo: [albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0],
            bin: `${band}/${rampBin}/${upwardBin}`,
            color: getPixelSceneColor(referenceShot, pixel),
            emission: [emission[pixel * 4] ?? 0, emission[pixel * 4 + 1] ?? 0, emission[pixel * 4 + 2] ?? 0],
            harmonics,
            rampCoordinate,
            scatter,
          },
        });
      }
      const eyePoint = eye.toArray();
      const solve = (density: number) =>
        solveStoneLight(
          pixels.map(({ point, sample }) => ({
            ...sample,
            opacity: computeFogOpacity(eyePoint, point, { ...fog, density }),
          })),
          fog,
        );
      return { count: pixels.length, ...solve(fog.density) };
    },
    () => browser.close(),
  );
};
