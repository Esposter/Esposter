// The kinds of trigger a tip's watcher gives, as the game's table spells them, that the world watches for a tip
export enum TipTriggerType {
  FinishParentQuestOr = "TRIGGER_FINISH_PARENT_QUEST_OR",
  FinishQuestAnd = "TRIGGER_FINISH_QUEST_AND",
  FinishQuestOr = "TRIGGER_FINISH_QUEST_OR",
  ObtainMaterialNum = "TRIGGER_OBTAIN_MATERIAL_NUM",
  WorldLevelUp = "TRIGGER_WORLD_LEVEL_UP",
}
