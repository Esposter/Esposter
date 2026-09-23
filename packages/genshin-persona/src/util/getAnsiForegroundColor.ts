const HEX_RADIX = 16;
const CHANNEL_LENGTH = 2;
const CHANNEL_OFFSETS = [1, 3, 5];
// A 24-bit foreground from a "#rrggbb" triplet. A terminal draws no alpha, so six digits is the whole palette
export const getAnsiForegroundColor = (hexColor: string): string => {
  const channels = CHANNEL_OFFSETS.map((offset) =>
    Number.parseInt(hexColor.slice(offset, offset + CHANNEL_LENGTH), HEX_RADIX),
  );
  return `\u001B[38;2;${channels.join(";")}m`;
};
