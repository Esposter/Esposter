import { LUMINANCE } from "#src/services/genshinParity/shared/constants";

export const toLuminance = (red: number, green: number, blue: number): number =>
  LUMINANCE[0] * red + LUMINANCE[1] * green + LUMINANCE[2] * blue;
