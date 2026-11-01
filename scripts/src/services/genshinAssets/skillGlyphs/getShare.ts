import { TONE_BIN_COUNT } from "#src/services/genshinAssets/skillGlyphs/constants";

// A bin's share of white, at its middle
export const getShare = (bin: number): number => (bin + 0.5) / TONE_BIN_COUNT;
