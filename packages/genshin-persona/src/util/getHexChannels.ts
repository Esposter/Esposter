import { HEX_CHANNEL_LENGTH, HEX_RADIX } from "#src/services/constants";

const CHANNEL_OFFSETS = [1, 3, 5];
// The red, green and blue of a "#rrggbb" triplet, 0 to 255. A terminal draws no alpha, so six digits is the whole
// Palette
export const getHexChannels = (hexColor: string): number[] =>
  CHANNEL_OFFSETS.map((offset) => Number.parseInt(hexColor.slice(offset, offset + HEX_CHANNEL_LENGTH), HEX_RADIX));
