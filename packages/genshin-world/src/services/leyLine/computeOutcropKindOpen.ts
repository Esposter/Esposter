import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";

// Whether one kind of a region's outcrop is open at this Adventure Rank, with the listed nations' areas unlocked
export const computeOutcropKindOpen = (
  { playerLevel, unlockCityIds }: OutcropKindRule,
  adventureRank: number,
  unlockedCityIds: number[],
): boolean => adventureRank >= playerLevel && unlockCityIds.every((cityId) => unlockedCityIds.includes(cityId));
