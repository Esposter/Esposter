import { DEPTH_PADDING_DIGITS } from "#src/services/dungeons/gridEngine/constants";

// A whole pixel count as a share below one: its digits are padded to the depth padding, so the share never reaches one
export const padDepth = (wholePixels: number) =>
  wholePixels / 10 ** Math.max(DEPTH_PADDING_DIGITS, `${wholePixels}`.length);
