import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import type { AchievementTriggerWatch } from "#src/models/achievement/AchievementTriggerWatch";

// The game's trigger types the world watches, each with the kind of doing it counts, the parameter slot its target id or
// Ids sit in, and whether its event advances the count by the event's quantity. An AND trigger names one id and an OR
// Trigger a list, and either counts each named id's doing once more. A trigger type not listed here is not watched yet,
// So its achievements never move
export const AchievementTriggerEventKindMap: Readonly<Record<string, AchievementTriggerWatch>> = {
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
  TRIGGER_OFFERING_LEVEL: { countsQuantity: false, kind: AchievementEventKind.OfferingLevelReached, targetSlot: 0 },
  TRIGGER_OPEN_WORLD_CHEST: { countsQuantity: false, kind: AchievementEventKind.ChestOpened, targetSlot: 0 },
  TRIGGER_UNLOCK_TRANS_POINT: { countsQuantity: false, kind: AchievementEventKind.TransPointUnlocked, targetSlot: 2 },
};
