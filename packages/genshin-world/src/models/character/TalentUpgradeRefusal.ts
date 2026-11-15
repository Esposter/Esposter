// Why a combat talent cannot rise one level now: it is at its last level, the character's ascension phase has not reached
// The level's, the wallet lacks the level's Mora, or the bag lacks the level's items
export const TalentUpgradeRefusal = {
  LastLevel: "LastLevel",
  Materials: "Materials",
  Mora: "Mora",
  Phase: "Phase",
} as const;
export type TalentUpgradeRefusal = (typeof TalentUpgradeRefusal)[keyof typeof TalentUpgradeRefusal];
