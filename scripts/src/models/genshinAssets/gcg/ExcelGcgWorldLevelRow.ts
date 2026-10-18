// One world-level duel of the card game's world table, as the dump names its plain fields: the game it duels, the NPC it
// Belongs to and the talk the duel is offered from
export interface ExcelGcgWorldLevelRow {
  levelId: number;
  npcId: number;
  talkId: number;
}
