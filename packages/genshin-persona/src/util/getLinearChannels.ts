import { getHexChannels } from "#src/util/getHexChannels";

const MAX_CHANNEL = 255;
// The red, green and blue of a "#rrggbb" triplet on 0 to 1, with sRGB's transfer function undone, so each is
// Proportional to the light it gives off: what WCAG's luminance and OKLab both start from
export const getLinearChannels = (hexColor: string): number[] =>
  getHexChannels(hexColor).map((channel) => {
    const value = channel / MAX_CHANNEL;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
