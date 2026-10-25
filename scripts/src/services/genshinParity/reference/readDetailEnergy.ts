import { DETAIL_WIDTH } from "#src/services/genshinParity/reference/constants";
import sharp from "sharp";

// What a pixel keeps above its surroundings' blur is its detail, and its detail is compared averaged over a patch
const DETAIL_BLUR_SIGMA = 2;
const ENERGY_BLUR_SIGMA = 6;

// An image's detail energy: how far each pixel's grey strays from its surroundings, averaged over a patch
export const readDetailEnergy = async (input: Buffer, height: number): Promise<Float32Array> => {
  const grey = sharp(input).resize(DETAIL_WIDTH, height, { fit: "fill" }).greyscale();
  const [{ data: sharpData }, { data: blurredData }] = await Promise.all([
    grey.clone().raw().toBuffer({ resolveWithObject: true }),
    grey.clone().blur(DETAIL_BLUR_SIGMA).raw().toBuffer({ resolveWithObject: true }),
  ]);
  const detail = Buffer.from(sharpData.map((value, index) => Math.abs(value - (blurredData[index] ?? 0))));
  const { data } = await sharp(detail, { raw: { channels: 1, height, width: DETAIL_WIDTH } })
    .blur(ENERGY_BLUR_SIGMA)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data);
};
