import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

export const readChannels = async (
  path: string,
  scale = 1,
): Promise<{ channels: Float64Array[]; height: number; width: number }> => {
  const image = sharp(path);
  const { width } = await image.metadata();
  const { data, info } = await (scale === 1 ? image : image.resize({ kernel: "cubic", width: width * scale }))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const count = info.width * info.height;
  return {
    channels: Array.from({ length: info.channels }, (_channel, channel) =>
      Float64Array.from({ length: count }, (_value, index) => (data[index * info.channels + channel] ?? 0) / BYTE),
    ),
    height: info.height,
    width: info.width,
  };
};
