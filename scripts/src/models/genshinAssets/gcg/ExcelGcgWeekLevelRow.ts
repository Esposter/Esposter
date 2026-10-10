// One challenger of the card game's week-level table, as the dump names its plain fields: the NPC it belongs to, and the
// Duel each Player Level opens for it
export interface ExcelGcgWeekLevelRow {
  levelCondList: { gcgLevel: number; levelId: number }[];
  npcId: number;
}
