import type { AchievementTriggerWatch } from "#src/models/achievement/AchievementTriggerWatch";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { AchievementTriggerEventKind } from "#src/models/achievement/AchievementTriggerEventKind";

// The game's trigger types the world watches, each with the kind of doing it counts, the parameter slot its target id or
// Ids sit in, and whether its event advances the count by the event's quantity. An AND trigger names one id or a list,
// Every one of which must be counted, and an OR trigger a list; either counts each named id's doing once more. A trigger
// Type not listed here is not watched yet, so its achievements never move
export const AchievementTriggerEventKindMap: Readonly<Record<string, AchievementTriggerWatch>> = {
  [AchievementTriggerEventKind.TriggerBattleForMonsterDieAnd]: {
    countsQuantity: false,
    everyTarget: true,
    kind: AchievementEventKind.MonsterDefeated,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerBattleForMonsterDieOr]: {
    countsEveryDoing: true,
    countsQuantity: false,
    kind: AchievementEventKind.MonsterDefeated,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerCityLevelUp]: {
    countsQuantity: false,
    kind: AchievementEventKind.StatueLevelReached,
    levelSlot: 1,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerCombineItem]: {
    countsQuantity: true,
    kind: AchievementEventKind.ItemCrafted,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerFinishParentQuestAnd]: {
    countsQuantity: false,
    kind: AchievementEventKind.ParentQuestFinished,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerFinishParentQuestOr]: {
    countsQuantity: false,
    kind: AchievementEventKind.ParentQuestFinished,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerFinishQuestAnd]: {
    countsQuantity: false,
    kind: AchievementEventKind.QuestFinished,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerFinishQuestOr]: {
    countsQuantity: false,
    kind: AchievementEventKind.QuestFinished,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerForgeWeapon]: {
    countsQuantity: false,
    kind: AchievementEventKind.WeaponForged,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerObtainItemNum]: {
    countsQuantity: true,
    kind: AchievementEventKind.ItemObtained,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerObtainMaterialNum]: {
    countsQuantity: true,
    kind: AchievementEventKind.MaterialObtained,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerOfferingLevel]: {
    countsQuantity: false,
    kind: AchievementEventKind.OfferingLevelReached,
    levelSlot: 1,
    targetSlot: 0,
  },
  // Provisional: the game's chest ids in the first slot are not joined to the placed chests, so a chest counts by its
  // Region alone, the chest id not matched
  [AchievementTriggerEventKind.TriggerOpenWorldChest]: {
    countsQuantity: false,
    kind: AchievementEventKind.ChestOpened,
    scopeSlot: 1,
    targetIsRegionOnly: true,
    targetSlot: 0,
  },
  [AchievementTriggerEventKind.TriggerUnlockTransPoint]: {
    countsQuantity: false,
    kind: AchievementEventKind.TransPointUnlocked,
    targetSlot: 2,
  },
};
