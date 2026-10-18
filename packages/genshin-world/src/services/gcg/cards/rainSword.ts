import { createGcgThresholdReduction } from "#src/services/gcg/effects/createGcgThresholdReduction";

const RAIN_SWORD_THRESHOLD = 3;
const RAIN_SWORD_REDUCTION = 1;
const RAIN_SWORD_USAGES = 2;

// Rain Sword, an onstage: when the active character receives at least 3 DMG, it takes one less, for two usages
export const rainSword = createGcgThresholdReduction(RAIN_SWORD_THRESHOLD, RAIN_SWORD_REDUCTION, RAIN_SWORD_USAGES);
