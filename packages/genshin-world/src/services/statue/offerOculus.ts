import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegion } from "#src/models/statue/StatueRegion";

// Offers one Oculus to a region's statues, which level together: the Oculus joins the held count, and each next level
// Whose Oculi the count now holds is reached in turn, taking those Oculi off it and paying its rewards. The levels
// Reached are returned in order so the caller pays each one. A region past its last level holds the Oculus as it is
export const offerOculus = (region: StatueRegion): { gainedLevels: StatueLevel[]; region: StatueRegion } => {
  const findNextLevel = (level: number): StatueLevel | undefined =>
    region.levels.find((statueLevel) => statueLevel.level === level + 1);
  let heldOculusCount = region.heldOculusCount + 1;
  let level = region.level;
  const gainedLevels: StatueLevel[] = [];
  let nextLevel = findNextLevel(level);
  while (nextLevel && heldOculusCount >= nextLevel.oculusCount) {
    heldOculusCount -= nextLevel.oculusCount;
    level = nextLevel.level;
    gainedLevels.push(nextLevel);
    nextLevel = findNextLevel(level);
  }
  return { gainedLevels, region: { ...region, heldOculusCount, level } };
};
