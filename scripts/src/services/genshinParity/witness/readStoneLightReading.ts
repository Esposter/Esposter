import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetLights } from "#src/models/genshinParity/witness/SetLights";
import type { StoneLightPixel } from "#src/models/genshinParity/witness/StoneLightPixel";
import type { StoneLightReading } from "#src/models/genshinParity/witness/StoneLightReading";
import type { SceneFog } from "genshin-world/parity/models/SceneFog";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { computePixelPoint } from "#src/services/genshinParity/shared/computePixelPoint";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessFamilies } from "#src/services/genshinParity/shared/readWitnessFamilies";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { checkIsPartInterior } from "#src/services/genshinParity/sky/checkIsPartInterior";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { STONE_HEIGHT_BANDS } from "#src/services/genshinParity/witness/constants";
import { shootWitnessFamilies } from "#src/services/genshinParity/witness/shootWitnessFamilies";
import { withFinalizerAsync } from "@esposter/shared";
import { computeStoneHarmonics, computeStoneRampCoordinate, STONE_HARMONIC_COUNT } from "genshin-engine";
import sharp from "sharp";
import { Matrix3, Matrix4, Vector3 } from "three";

// A pixel's bin: its depth band, in metres between one and the next, its height band (`STONE_HEIGHT_BANDS`), its
// Ramp coordinate in this many steps, and how far its face turns up in this many, so each bin holds faces the light
// And the haze treat alike, and the light solved over it stands neither too dark below nor too bright above
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640, Infinity];
const RAMP_BIN_COUNT = 12;
const UPWARD_BIN_COUNT = 4;
const readPage = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
// A reference's stone as the game's deferred pass casts it, read over the parts the witness draws from the game's
// Exports: each part's interior pixel where the scene puts it, its reference colour as the screen shows it, the
// Exports' albedo, their normal against the scene's sun and the sun's visibility there giving its ramp coordinate and
// Its harmonics, the scene's occlusion and how far it looks toward the haze's sunward glow, beside the eye, the scene's
// Own haze and the white balance its frame passes through. Each sample's opacity is left at none for the haze a solve
// Sets. With `isSelf` the colours are the exports as the scene draws them under its own light rather than the
// Reference's, which a solve modelling the renderer should hand that light back from
export const readStoneLightReading = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSelf = false,
): Promise<StoneLightReading> => {
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
          occlusion = new Float32Array(),
          part = new Float32Array(),
          shadow = new Float32Array(),
        },
        width,
      } = await readWitnessTargets(page, [
        WitnessTargetName.Albedo,
        WitnessTargetName.Depth,
        WitnessTargetName.Emission,
        WitnessTargetName.Normal,
        WitnessTargetName.Occlusion,
        WitnessTargetName.Part,
        WitnessTargetName.Shadow,
      ]);
      const sky = await readPage<{ matrixWorld: number[]; projectionMatrixInverse: number[] }>(page, "getSceneSky");
      const fog = await readPage<SceneFog>(page, "getSceneFog");
      const whiteBalance = new Matrix3().fromArray(await readPage<number[]>(page, "getSceneWhiteBalance"));
      const { direction } = await page.evaluate(() => (Reflect.get(window, "setSceneLights") as SetLights)({}));
      const source = isSelf
        ? await shootWitnessFamilies(page, await readWitnessFamilies(page), { height, width })
        : image;
      await setPageWitnessView(page, {});
      const referenceShot = await sharp(source).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const matrixWorld = new Matrix4().fromArray(sky.matrixWorld);
      const projectionMatrixInverse = new Matrix4().fromArray(sky.projectionMatrixInverse);
      const eye = new Vector3().setFromMatrixPosition(matrixWorld);
      const sun = new Vector3(...direction).normalize();
      const scatterDirection = new Vector3(...fog.scatterDirection).normalize();
      const pixels: StoneLightPixel[] = [];
      for (let pixel = 0; pixel < width * height; pixel++) {
        if (!checkIsPartInterior(part, width, height, pixel) || !checkIsScored(pixel, width)) continue;
        const pixelDepth = depth[pixel * 4] ?? 0;
        const point = computePixelPoint(pixel, { height, width }, pixelDepth, { matrixWorld, projectionMatrixInverse });
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
        const heightBand = STONE_HEIGHT_BANDS.findIndex((top) => point.y < top);
        const rampBin = Math.min(Math.floor(rampCoordinate * RAMP_BIN_COUNT), RAMP_BIN_COUNT - 1);
        const upwardBin = Math.min(Math.floor(((faceNormal.y + 1) / 2) * UPWARD_BIN_COUNT), UPWARD_BIN_COUNT - 1);
        pixels.push({
          point: point.toArray(),
          sample: {
            albedo: [albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0],
            bin: `${band}/${heightBand}/${rampBin}/${upwardBin}`,
            display: getPixelDisplayColor(referenceShot, pixel),
            emission: [emission[pixel * 4] ?? 0, emission[pixel * 4 + 1] ?? 0, emission[pixel * 4 + 2] ?? 0],
            harmonics,
            height: point.y,
            lightBin: `${rampBin}/${upwardBin}`,
            occlusion: occlusion[pixel * 4] ?? 1,
            opacity: 0,
            part: part[pixel * 4] ?? 0,
            rampCoordinate,
            scatter,
          },
        });
      }
      return { eye: eye.toArray(), fog, pixels, whiteBalance };
    },
    () => browser.close(),
  );
};
