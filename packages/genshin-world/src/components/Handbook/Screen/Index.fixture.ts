import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";

// The Experience page of the English client's Adventurer Handbook, Chapter 9, with every investigation done
export const props = {
  commissions: [
    {
      progress: 3,
      rewards: [
        { count: 4000, rarity: 3 },
        { count: 5, rarity: 4 },
      ],
      titleKey: GameTextKey.HandbookCommissionAscendCharactersPhase5,
      total: 3,
    },
    {
      progress: 1,
      rewards: [
        { count: 4000, rarity: 3 },
        { count: 5, rarity: 4 },
      ],
      titleKey: GameTextKey.HandbookCommissionLevelUpCharacterLv80,
      total: 1,
    },
    {
      progress: 3,
      rewards: [
        { count: 4000, rarity: 3 },
        { count: 10, rarity: 3 },
      ],
      titleKey: GameTextKey.HandbookCommissionAscendWeaponsPhase5,
      total: 3,
    },
    {
      progress: 1,
      rewards: [
        { count: 4000, rarity: 3 },
        { count: 10, rarity: 3 },
      ],
      titleKey: GameTextKey.HandbookCommissionEnhanceWeaponLv80,
      total: 1,
    },
    {
      progress: 8,
      rewards: [
        { count: 4000, rarity: 3 },
        { count: 1, rarity: 5 },
      ],
      titleKey: GameTextKey.HandbookCommissionEnhanceArtifactsLv20,
      total: 8,
    },
  ],
  canUseLongTermEncounterPoints: false,
  completedCount: 11,
  dayCommissions: [],
  gameText: ENGLISH_GAME_TEXT,
  investigationRewards: [
    { count: 1, rarity: 5 },
    { count: 6, rarity: 4 },
    { count: 50000, rarity: 3 },
    { count: 150, rarity: 5 },
  ],
  domains: [],
  encounterPointLimit: 4,
  encounterPoints: 2,
  isAdventureEncountersUnlocked: true,
  isRewardClaimed: true,
  longTermEncounterPoints: 0,
  nameText: {},
  totalCount: 11,
};
