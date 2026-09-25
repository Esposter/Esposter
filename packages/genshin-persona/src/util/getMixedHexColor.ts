import { getHexChannels } from "#src/util/getHexChannels";
import { getHexColor } from "#src/util/getHexColor";

const PERCENT = 100;
// `color-mix(in srgb, <hexColor> <percentage>%, <otherHexColor>)` as a "#rrggbb" triplet, channel by channel
export const getMixedHexColor = (hexColor: string, percentage: number, otherHexColor: string): string => {
  const otherChannels = getHexChannels(otherHexColor);
  return getHexColor(
    getHexChannels(hexColor).map(
      (channel, index) => (channel * percentage + (otherChannels[index] ?? 0) * (PERCENT - percentage)) / PERCENT,
    ),
  );
};
