import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { CloudStatistics } from "#src/models/genshinParity/CloudStatistics";

import { CLOUDS_WIDTH, COMPARISONS_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { measureClouds } from "#src/services/genshinParity/measureClouds";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readCloudSky } from "#src/services/genshinParity/readCloudSky";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BYTE = 255;
// A clear sky's pixel in the sheet's masks, between a cloud's white and the rest's black
const CLEAR_SHADE = 96;
// A reference's clouds and ours by their statistics (`measureClouds`) and their cover band by band of their height over
// The horizon, over the sky above it where no part stands (`readCloudSky`). Each frame is written beside its clouds,
// The reference's over ours, for the eye
export const readCloudStatistics = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  elevationCoverage: { ours: number[]; reference: number[] };
  ours: CloudStatistics;
  reference: CloudStatistics;
}> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      const { readClouds, readElevationCoverage, readLuminance, skyMask, width } = await readCloudSky(page, {
        checkIsScored,
        height,
      });
      await setPageWitnessView(page, { families: [] });
      const ourShot = await page.screenshot();
      const [ourLuminance, referenceLuminance] = await Promise.all([readLuminance(ourShot), readLuminance(image)]);
      const [ourClouds, referenceClouds] = [readClouds(ourLuminance), readClouds(referenceLuminance)];
      // A cloud white, the clear sky grey, and the rest black
      const toMask = (clouds: Uint8Array): Promise<Buffer> =>
        sharp(Buffer.from(clouds.map((cloud, pixel) => (cloud ? BYTE : (skyMask[pixel] ?? 0) * CLEAR_SHADE))), {
          raw: { channels: 1, height, width },
        })
          .png()
          .toBuffer();
      const tiles = [image, await toMask(referenceClouds), ourShot, await toMask(ourClouds)];
      const sheet = await sharp({ create: { background: "#000", channels: 3, height: height * 2, width: width * 2 } })
        .composite(
          await Promise.all(
            tiles.map(async (tile, index) => ({
              input: await sharp(tile).resize(width, height, { fit: "fill" }).toBuffer(),
              left: (index % 2) * width,
              top: Math.floor(index / 2) * height,
            })),
          ),
        )
        .png()
        .toBuffer();
      await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
      await writeFile(join(COMPARISONS_DIRECTORY, `${referenceId}.clouds.png`), sheet);
      return {
        elevationCoverage: {
          ours: readElevationCoverage(ourClouds),
          reference: readElevationCoverage(referenceClouds),
        },
        ours: measureClouds(ourLuminance, { clouds: ourClouds, sky: skyMask }, width, height),
        reference: measureClouds(referenceLuminance, { clouds: referenceClouds, sky: skyMask }, width, height),
      };
    },
    () => browser.close(),
  );
};
