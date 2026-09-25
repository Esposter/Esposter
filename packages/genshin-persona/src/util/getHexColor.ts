import { HEX_CHANNEL_LENGTH, HEX_RADIX } from "#src/services/constants";

// A "#rrggbb" triplet from red, green and blue on 0 to 255, each rounded to the nearest whole step: `getHexChannels`
// Read the other way
export const getHexColor = (channels: number[]): string =>
  `#${channels.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(HEX_CHANNEL_LENGTH, "0")).join("")}`;
