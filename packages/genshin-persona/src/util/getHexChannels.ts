const HEX_RADIX = 16;
const CHANNEL_LENGTH = 2;
const CHANNEL_OFFSETS = [1, 3, 5];
// The red, green and blue of a "#rrggbb" triplet, 0 to 255. A terminal draws no alpha, so six digits is the whole
// Palette
export const getHexChannels = (hexColor: string): number[] =>
  CHANNEL_OFFSETS.map((offset) => Number.parseInt(hexColor.slice(offset, offset + CHANNEL_LENGTH), HEX_RADIX));
