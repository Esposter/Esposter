import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import sharp from "sharp";

// The texels a diffuse texture is reduced to before its median is taken, enough for a colour a whole part is painted
const ALBEDO_SAMPLE_SIZE = 64;
// The colour a set of diffuse textures paint their parts with, as one hex: the median of each channel over all their
// Texels, so a carved line or a worn corner leaves it where the stone mostly is. The light, never the texture, warms
// And cools it at the hour
export const fitAlbedo = async (texturePaths: readonly string[]): Promise<string> => {
  const channels: [number[], number[], number[]] = [[], [], []];
  for (const path of texturePaths) {
    // oxlint-disable-next-line no-await-in-loop -- one texture is read at a time
    const { data, info } = await sharp(path)
      .resize(ALBEDO_SAMPLE_SIZE, ALBEDO_SAMPLE_SIZE, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let texel = 0; texel < info.width * info.height; texel++)
      for (const [channel, values] of channels.entries()) values.push(data[texel * info.channels + channel] ?? 0);
  }
  const median = channels.map((values) => computeUpperMedian(values));
  return `#${median.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
};
