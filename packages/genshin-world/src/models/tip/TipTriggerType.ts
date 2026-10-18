// The kinds of trigger a tip's watcher gives, as the game's table spells them, that the world watches for a tip
export enum TipTriggerType {
  FinishQuestAnd = "TRIGGER_FINISH_QUEST_AND",
  FinishQuestOr = "TRIGGER_FINISH_QUEST_OR",
  ObtainMaterialNum = "TRIGGER_OBTAIN_MATERIAL_NUM",
  WorldLevelUp = "TRIGGER_WORLD_LEVEL_UP",
}
