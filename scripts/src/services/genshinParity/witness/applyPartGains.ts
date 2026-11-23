import { CHANNELS } from "#src/services/genshinParity/shared/constants";

// Every part pixel scaled by its own gain, channel by channel, the rest left as drawn
export const applyPartGains = ({
  checkIsPart,
  exports,
  getGain,
}: {
  checkIsPart: (pixel: number) => boolean;
  exports: Float32Array;
  getGain: (pixel: number, channel: number) => number;
}): Float32Array =>
  exports.map((value, index) => {
    const pixel = Math.floor(index / CHANNELS.length);
    return checkIsPart(pixel) ? value * getGain(pixel, index % CHANNELS.length) : value;
  });
