// One challenger of the card game's week-level table, as the dump names its plain fields: the NPC it belongs to, and
// The Duel each Player Level opens for it. A slot the NPC has no duel for reads as zeros, the default the table reader
// Fills in
export interface ExcelGcgWeekLevelRow {
  levelCondList: { gcgLevel: number; levelId: number }[];
  npcId: number;
}
