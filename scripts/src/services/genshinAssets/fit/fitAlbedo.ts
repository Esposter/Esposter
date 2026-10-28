import { computeUpperMedian } from "#src/services/recreation/statistics/computeUpperMedian";
import { toHex } from "#src/services/shared/toHex";
import { settleAll } from "@esposter/shared";
import sharp from "sharp";

// The texels a diffuse texture is reduced to before its median is taken, enough for a colour a whole part is painted
const ALBEDO_SAMPLE_SIZE = 64;
// The textures decoded at once, each full-size source held whole while it is resized down to its texels
const ALBEDO_DECODE_CONCURRENCY = 4;
// The colour a set of diffuse textures paint their parts with, as one hex: the median of each channel over all their
// Texels, so a carved line or a worn corner leaves it where the stone mostly is. The light, never the texture, warms
// And cools it at the hour
export const fitAlbedo = async (texturePaths: readonly string[]): Promise<string> => {
  const decoded = await settleAll(
    texturePaths.map(
      (path) => () =>
        sharp(path)
          .resize(ALBEDO_SAMPLE_SIZE, ALBEDO_SAMPLE_SIZE, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true }),
    ),
    ALBEDO_DECODE_CONCURRENCY,
  );
  const channels: [number[], number[], number[]] = [[], [], []];
  for (const { data, info } of decoded)
    for (let texel = 0; texel < info.width * info.height; texel++)
      for (const [channel, values] of channels.entries()) values.push(data[texel * info.channels + channel] ?? 0);
  const [red, green, blue] = channels;
  return toHex([computeUpperMedian(red), computeUpperMedian(green), computeUpperMedian(blue)]);
};
