import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import sharp from "sharp";

const BYTE = 255;
// How many samples each curve is kept as, evenly from the horizon to the band's end: the curves are smooth, so a
// Linear reading between them stays within a byte of the texture's
const SAMPLE_COUNT = 33;
// The sky gradient's two curves as the sky's shader reads them: across its width, at the middle of its height (its
// Two rows averaged), the red the share of the bottom colour over the top by height, from the horizon at its left, and
// The green the horizon halo's, each kept as evenly spaced samples the scene draws back into a texture of its own
export const fitSkyGradient = async (gradient: Buffer | string): Promise<{ green: number[]; red: number[] }> => {
  const { data, info } = await sharp(gradient).raw().toBuffer({ resolveWithObject: true });
  const readChannel = (channel: number, u: number): number => {
    const x = u * (info.width - 1);
    const left = Math.floor(x);
    const right = Math.min(left + 1, info.width - 1);
    const readTexel = (column: number): number => {
      let sum = 0;
      for (let row = 0; row < info.height; row++)
        sum += data[(row * info.width + column) * info.channels + channel] ?? 0;
      return sum / info.height / BYTE;
    };
    return readTexel(left) + (readTexel(right) - readTexel(left)) * (x - left);
  };
  const sample = (channel: number): number[] =>
    Array.from({ length: SAMPLE_COUNT }, (_, index) => roundFitted(readChannel(channel, index / (SAMPLE_COUNT - 1))));
  return { green: sample(1), red: sample(0) };
};
