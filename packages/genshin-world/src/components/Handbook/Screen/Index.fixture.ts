import { HandbookRewardTone } from "#src/models/handbook/HandbookRewardTone";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";

// The Experience page of the English client's Adventurer Handbook, Chapter 9, with every investigation done
export const props = {
  commissions: [
    {
      progress: 3,
      rewards: [
        { count: 4000, tone: HandbookRewardTone.Orange },
        { count: 5, tone: HandbookRewardTone.Book },
      ],
      titleKey: GameTextKey.HandbookCommissionAscendCharactersPhase5,
      total: 3,
    },
    {
      progress: 1,
      rewards: [
        { count: 4000, tone: HandbookRewardTone.Orange },
        { count: 5, tone: HandbookRewardTone.Book },
      ],
      titleKey: GameTextKey.HandbookCommissionLevelUpCharacterLv80,
      total: 1,
    },
    {
      progress: 3,
      rewards: [
        { count: 4000, tone: HandbookRewardTone.Orange },
        { count: 10, tone: HandbookRewardTone.Orange },
      ],
      titleKey: GameTextKey.HandbookCommissionAscendWeaponsPhase5,
      total: 3,
    },
    {
      progress: 1,
      rewards: [
        { count: 4000, tone: HandbookRewardTone.Orange },
        { count: 10, tone: HandbookRewardTone.Orange },
      ],
      titleKey: GameTextKey.HandbookCommissionEnhanceWeaponLv80,
      total: 1,
    },
    {
      progress: 8,
      rewards: [
        { count: 4000, tone: HandbookRewardTone.Orange },
        { count: 1, tone: HandbookRewardTone.Orange },
      ],
      titleKey: GameTextKey.HandbookCommissionEnhanceArtifactsLv20,
      total: 8,
    },
  ],
  completedCount: 11,
  gameText: ENGLISH_GAME_TEXT,
  investigationRewards: [
    { count: 1, tone: HandbookRewardTone.Orange },
    { count: 6, tone: HandbookRewardTone.Book },
    { count: 50000, tone: HandbookRewardTone.Orange },
    { count: 150, tone: HandbookRewardTone.Orange },
  ],
  isRewardClaimed: true,
  totalCount: 11,
};
