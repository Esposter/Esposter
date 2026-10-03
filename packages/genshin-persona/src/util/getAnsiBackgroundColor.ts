import { getHexChannels } from "#src/util/getHexChannels";

// A 24-bit background from a "#rrggbb" triplet
export const getAnsiBackgroundColor = (hexColor: string): string =>
  `\u001B[48;2;${getHexChannels(hexColor).join(";")}m`;
