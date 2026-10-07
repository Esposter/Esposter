import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { CLOUDS_WIDTH, COMPARISONS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readSkyComparison } from "#src/services/genshinParity/sky/readSkyComparison";
import { BYTE } from "#src/services/shared/constants";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A clear sky's pixel in the sheet's masks, between a cloud's white and the rest's black
const CLEAR_SHADE = 96;
// A reference's sky and the scene's as statistics blind to where their clouds stand (`readSkyComparison`): each one's,
// How far ours stands from the reference's, the spread two halves of the reference's own sky stand apart, and how many
// Pixels of sky they are read over. Each frame is written beside its clouds, the reference's over ours, for the eye
export const readCloudStatistics = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  distance: SkyDistance;
  ours: SkyStatistics;
  reference: SkyStatistics;
  skyCount: number;
  spread: SkyDistance;
}> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      const { compareShot, reference, referenceClouds, sky, spread } = await readSkyComparison(
        page,
        referenceId,
        witness,
        { checkIsScored, height, image },
      );
      const ourShot = await page.screenshot();
      const { clouds: ourClouds, distance, statistics } = await compareShot(ourShot);
      const width = sky.length / height;
      // A cloud white, the clear sky grey, and the rest black
      const toMask = (clouds: Uint8Array): Promise<Buffer> =>
        sharp(Buffer.from(clouds.map((cloud, pixel) => (cloud ? BYTE : (sky[pixel] ?? 0) * CLEAR_SHADE))), {
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
      return { distance, ours: statistics, reference, skyCount: sky.reduce((sum, isSky) => sum + isSky, 0), spread };
    },
    () => browser.close(),
  );
};
