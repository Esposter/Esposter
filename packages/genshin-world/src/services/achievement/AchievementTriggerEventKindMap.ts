import type { AchievementTriggerWatch } from "#src/models/achievement/AchievementTriggerWatch";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// The game's trigger types the world watches, each with the kind of doing it counts, the parameter slot its target id or
// Ids sit in, and whether its event advances the count by the event's quantity. An AND trigger names one id or a list,
// Every one of which must be counted, and an OR trigger a list; either counts each named id's doing once more. A trigger
// Type not listed here is not watched yet, so its achievements never move
export const AchievementTriggerEventKindMap: Readonly<Record<string, AchievementTriggerWatch>> = {
  TRIGGER_BATTLE_FOR_MONSTER_DIE_AND: {
    countsQuantity: false,
    everyTarget: true,
    kind: AchievementEventKind.MonsterDefeated,
    targetSlot: 0,
  },
  TRIGGER_FINISH_PARENT_QUEST_AND: {
    countsQuantity: false,
    kind: AchievementEventKind.ParentQuestFinished,
    targetSlot: 0,
  },
  TRIGGER_FINISH_PARENT_QUEST_OR: {
    countsQuantity: false,
    kind: AchievementEventKind.ParentQuestFinished,
    targetSlot: 0,
  },
  TRIGGER_FINISH_QUEST_AND: { countsQuantity: false, kind: AchievementEventKind.QuestFinished, targetSlot: 0 },
  TRIGGER_FINISH_QUEST_OR: { countsQuantity: false, kind: AchievementEventKind.QuestFinished, targetSlot: 0 },
  TRIGGER_OBTAIN_MATERIAL_NUM: { countsQuantity: true, kind: AchievementEventKind.MaterialObtained, targetSlot: 0 },
  TRIGGER_OFFERING_LEVEL: {
    countsQuantity: false,
    kind: AchievementEventKind.OfferingLevelReached,
    levelSlot: 1,
    targetSlot: 0,
  },
  TRIGGER_OPEN_WORLD_CHEST: {
    countsQuantity: false,
    kind: AchievementEventKind.ChestOpened,
    scopeSlot: 1,
    targetSlot: 0,
  },
  TRIGGER_UNLOCK_TRANS_POINT: { countsQuantity: false, kind: AchievementEventKind.TransPointUnlocked, targetSlot: 2 },
};
