import { BLOOM_SCREENS } from "#src/services/genshinParity/passes/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The references among the given ones whose screen draws the game's bloom, the only ones a bloom reading can tell drawn
// From undrawn, since a reference of any other screen is drawn the same either way
export const getBloomReferenceIds = (referenceIds: string[]): string[] =>
  referenceIds.filter((referenceId) => {
    const screen = ParityReferenceMap[referenceId]?.screen;
    return screen !== undefined && BLOOM_SCREENS.includes(screen);
  });
