import { getHexChannels } from "#src/util/getHexChannels";

// A 24-bit foreground from a "#rrggbb" triplet
export const getAnsiForegroundColor = (hexColor: string): string =>
  `\u001B[38;2;${getHexChannels(hexColor).join(";")}m`;
