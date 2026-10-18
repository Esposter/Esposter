import { createGcgThresholdReduction } from "#src/services/gcg/effects/createGcgThresholdReduction";

const JADE_SCREEN_THRESHOLD = 2;
const JADE_SCREEN_REDUCTION = 1;
const JADE_SCREEN_USAGES = 2;

// Jade Screen, an onstage: when the active character receives at least 2 DMG, it takes one less, for two usages
export const jadeScreen = createGcgThresholdReduction(JADE_SCREEN_THRESHOLD, JADE_SCREEN_REDUCTION, JADE_SCREEN_USAGES);
