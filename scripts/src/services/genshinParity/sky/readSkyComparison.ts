import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";
import type { Vector } from "#src/models/shared/Vector";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { ATMOSPHERE_SPLIT_BLOCK_SIZES } from "#src/services/genshinParity/passes/constants";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { LUMINANCE } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { compareSkyStatistics } from "#src/services/genshinParity/sky/compareSkyStatistics";
import { computeSkySplitSpread } from "#src/services/genshinParity/sky/computeSkySplitSpread";
import { measureClouds } from "#src/services/genshinParity/sky/measureClouds";
import { readCloudSky } from "#src/services/genshinParity/sky/readCloudSky";
import { BYTE } from "#src/services/shared/constants";
import { toLab } from "#src/services/shared/toLab";
import { toLinear } from "#src/services/shared/toLinear";
import { toXyz } from "#src/services/shared/toXyz";
import sharp from "sharp";

// A witness page's reference and the scene's sky beside it as statistics blind to where their clouds stand
// (`SkyStatistics`), since the game scatters its clouds and drifts its cloud layer, so no score by pixels judges ours:
// At the reference's camera, solved on its landmarks where it has them (`solveReferenceCamera`) and the scene's own in
// The reference's state otherwise, over the sky above the horizon that neither the exports' parts nor the scene's own
// Cover, each image's clouds split from its own clear sky alike (`readCloudSky`). Handed back are the camera, the sky
// And the reference's clouds over it, the reference's statistics, the spread two halves of its own sky stand apart
// (`computeSkySplitSpread`), and how far a shot of the scene at that camera stands from it, with its clouds. The page
// Is left at the camera, the scene drawing its own parts
export const readSkyComparison = async (
  page: Page,
  referenceId: string,
  component: DerivedAssetComponent,
  {
    checkIsScored,
    height,
    image,
  }: { checkIsScored: (pixel: number, width: number) => boolean; height: number; image: Buffer },
): Promise<{
  camera: NonNullable<WitnessView["camera"]>;
  compareShot: (shot: Buffer) => Promise<{ clouds: Uint8Array; distance: SkyDistance; statistics: SkyStatistics }>;
  reference: SkyStatistics;
  referenceClouds: Uint8Array;
  sky: Uint8Array;
  spread: SkyDistance;
}> => {
  const camera = ParityReferenceMap[referenceId]?.landmarks
    ? toPageCamera((await solveReferenceCamera(page, referenceId, component)).pose)
    : await page.evaluate(() => (Reflect.get(window, "getSceneCamera") as () => NonNullable<WitnessView["camera"]>)());
  await setPageWitnessView(page, { camera });
  const { computeClouds, computeElevationCoverage, skyMask, width } = await readCloudSky(page, {
    checkIsScored,
    height,
  });
  // The scene draws its own parts only where the witness draws none of its families
  await setPageWitnessView(page, { camera, families: [] });
  const {
    targets: { part: scenePart = new Float32Array() },
  } = await readWitnessTargets(page, [WitnessTargetName.Part], true);
  const sky = skyMask.map((isSky, pixel) => Number(isSky === 1 && !scenePart[pixel * 4]));
  // An image's sky over a region of it: its colour in linear light and its luminance at the size the sky is read at,
  // Its clouds split from its clear sky over the whole sky, and its statistics over the region given
  const readStatistics = async (
    input: Buffer,
  ): Promise<{ clouds: Uint8Array; readRegion: (region: Uint8Array) => SkyStatistics }> => {
    const data = await sharp(input).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const linear = Float32Array.from(data, (value) => toLinear(value / BYTE));
    const luminance = Float32Array.from({ length: width * height }, (_value, pixel) =>
      LUMINANCE.reduce((sum, weight, channel) => sum + weight * (linear[pixel * 3 + channel] ?? 0), 0),
    );
    const clouds = computeClouds(luminance, sky);
    const readRegion = (region: Uint8Array): SkyStatistics => {
      const clearSum: Vector = [0, 0, 0];
      const cloudSum: Vector = [0, 0, 0];
      let [clearCount, cloudCount] = [0, 0];
      for (const [pixel, isSky] of region.entries()) {
        if (!isSky) continue;
        const sum = clouds[pixel] ? cloudSum : clearSum;
        if (clouds[pixel]) cloudCount++;
        else clearCount++;
        for (const channel of [0, 1, 2] as const) sum[channel] += linear[pixel * 3 + channel] ?? 0;
      }
      const toMeanLab = (sum: Vector, count: number): Vector => {
        const [red = 0, green = 0, blue = 0] = sum.map((channelSum) => channelSum / Math.max(count, 1));
        return toLab(toXyz([red, green, blue]));
      };
      return {
        clearColour: toMeanLab(clearSum, clearCount),
        cloudColour: toMeanLab(cloudSum, cloudCount),
        clouds: measureClouds(luminance, { clouds, sky: region }, width, height),
        elevationCoverage: computeElevationCoverage(clouds, region),
      };
    };
    return { clouds, readRegion };
  };
  const { clouds: referenceClouds, readRegion: readReference } = await readStatistics(image);
  const reference = readReference(sky);
  return {
    camera,
    compareShot: async (shot) => {
      const { clouds, readRegion } = await readStatistics(shot);
      const statistics = readRegion(sky);
      return { clouds, distance: compareSkyStatistics(statistics, reference), statistics };
    },
    reference,
    referenceClouds,
    sky,
    spread: computeSkySplitSpread(readReference, sky, width, ATMOSPHERE_SPLIT_BLOCK_SIZES),
  };
};
