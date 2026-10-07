import { COMPARISONS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A clear sky's pixel in the sheet's masks, between a cloud's white and the rest's black
const CLEAR_SHADE = 96;
// A reference's frame and ours each beside its clouds, the reference's over ours, for the eye: a cloud white, the clear
// Sky grey and the rest black, written beside the comparisons under the name given
export const writeCloudSheet = async (
  name: string,
  {
    height,
    ourClouds,
    ourShot,
    referenceClouds,
    referenceImage,
    sky,
  }: {
    height: number;
    ourClouds: Uint8Array;
    ourShot: Buffer;
    referenceClouds: Uint8Array;
    referenceImage: Buffer;
    sky: Uint8Array;
  },
): Promise<void> => {
  const width = sky.length / height;
  const toMask = (clouds: Uint8Array): Promise<Buffer> =>
    sharp(Buffer.from(clouds.map((cloud, pixel) => (cloud ? BYTE : (sky[pixel] ?? 0) * CLEAR_SHADE))), {
      raw: { channels: 1, height, width },
    })
      .png()
      .toBuffer();
  const tiles = [referenceImage, await toMask(referenceClouds), ourShot, await toMask(ourClouds)];
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
  await writeFile(join(COMPARISONS_DIRECTORY, `${name}.png`), sheet);
};
