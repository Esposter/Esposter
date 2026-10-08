import { IMAGINARIUM_BLESSING_LEVEL_PER_EXTRA_MEMBER } from "#src/services/imaginarium/constants";

// The Blessing Level a run holds: each Alternate Cast member past the number its difficulty asks adds two, and each Brilliant
// Blessing adds the levels it has been gained and raised to, one for each
export const computeImaginariumBlessingLevel = (
  alternateCastCount: number,
  requiredCount: number,
  brilliantBlessingLevels: number[],
): number =>
  Math.max(0, alternateCastCount - requiredCount) * IMAGINARIUM_BLESSING_LEVEL_PER_EXTRA_MEMBER +
  brilliantBlessingLevels.reduce((total, level) => total + level, 0);
