import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SetLights } from "#src/models/genshinParity/witness/SetLights";
import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";
import type { SceneFog } from "genshin-world/parity/models/SceneFog";
import type { Page } from "playwright";
import type { Except } from "type-fest";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { computePixelPoint } from "#src/services/genshinParity/shared/computePixelPoint";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessFamilies } from "#src/services/genshinParity/shared/readWitnessFamilies";
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

// A pixel's bin: its depth band, in metres between one and the next, its height band, in metres up to each top, its
// Ramp coordinate in this many steps, and how far its face turns up in this many, so each bin holds faces the light
// And the haze treat alike: the haze thins with height, so a bin spanning it would average the low stone it pales into
// The high stone it leaves, and the light solved over it stands too dark below and too bright above
const DEPTH_BANDS = [0, 10, 20, 40, 80, 160, 320, 640, Infinity];
const HEIGHT_BANDS = [-20, -10, -5, 0, 5, 10, 20, 40, Infinity];
const RAMP_BIN_COUNT = 12;
const UPWARD_BIN_COUNT = 4;
// The haze's refinement: the simplex's steps over its density's and its falloff's logarithms, and how many it takes
const HAZE_STEPS = [0.5, 0.5];
const HAZE_ITERATION_COUNT = 60;
// A haze from the logarithms of its density and its falloff, the simplex's coordinates, so neither falls under none
const toHaze = ([density = 0, heightFalloff = 0]: readonly number[]): Pick<SceneFog, "density" | "heightFalloff"> => ({
  density: Math.exp(density),
  heightFalloff: Math.exp(heightFalloff),
});
const readPage = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
// A reference's stone light solved as the game's deferred pass casts it, over the parts the witness draws from the
// Game's exports: each part's interior pixel, its reference colour taken back into scene colour (`toSceneColor`), the
// Exports' albedo, their normal against the scene's sun and the sun's visibility there giving its ramp coordinate and
// Its harmonics, and the scene's own haze giving its opacity and its colours. The light is a linear solve over the bins
// (`solveStoneLight`) under the scene's own haze, or under the haze's density and height falloff refined with it by
// The simplex on that solve's residual, its colours held as the cloud sea's: the bins split by height, the high stone
// The haze leaves holds the light, and the low stone it pales the haze's profile
export const solveReferenceStoneLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  { isHazeSolved = false, isSelf = false }: { isHazeSolved?: boolean; isSelf?: boolean } = {},
): Promise<{
  count: number;
  deviation: number;
  haze: Pick<SceneFog, "density" | "heightFalloff">;
  light: StoneLight;
  residual: number;
  sceneResidual: number;
}> => {
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
      const pixels: { point: Vector; sample: Except<StoneLightSample, "opacity"> }[] = [];
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
        const heightBand = HEIGHT_BANDS.findIndex((top) => point.y < top);
        const rampBin = Math.min(Math.floor(rampCoordinate * RAMP_BIN_COUNT), RAMP_BIN_COUNT - 1);
        const upwardBin = Math.min(Math.floor(((faceNormal.y + 1) / 2) * UPWARD_BIN_COUNT), UPWARD_BIN_COUNT - 1);
        pixels.push({
          point: point.toArray(),
          sample: {
            albedo: [albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0],
            bin: `${band}/${heightBand}/${rampBin}/${upwardBin}`,
            color: getPixelSceneColor(referenceShot, pixel),
            emission: [emission[pixel * 4] ?? 0, emission[pixel * 4 + 1] ?? 0, emission[pixel * 4 + 2] ?? 0],
            harmonics,
            rampCoordinate,
            scatter,
          },
        });
      }
      const eyePoint = eye.toArray();
      const solve = (haze: Pick<SceneFog, "density" | "heightFalloff">) =>
        solveStoneLight(
          pixels.map(({ point, sample }) => ({
            ...sample,
            opacity: computeFogOpacity(eyePoint, point, { ...fog, ...haze }),
          })),
          fog,
        );
      const sceneHaze = { density: fog.density, heightFalloff: fog.heightFalloff };
      const sceneSolution = solve(sceneHaze);
      if (!isHazeSolved)
        return { count: pixels.length, haze: sceneHaze, sceneResidual: sceneSolution.residual, ...sceneSolution };
      const { point } = await minimizeNelderMead(
        (logs) => Promise.resolve(solve(toHaze(logs)).residual),
        [Math.log(fog.density), Math.log(fog.heightFalloff)],
        HAZE_STEPS,
        HAZE_ITERATION_COUNT,
      );
      const haze = toHaze(point);
      return { count: pixels.length, haze, sceneResidual: sceneSolution.residual, ...solve(haze) };
    },
    () => browser.close(),
  );
};
