// The fields read off one row of the game's quest codex: its id, the main quest it is filed under, its order in the codex
// And whether the codex has left it out
export interface ExcelQuestCodexRow {
  id: number;
  isDisuse: boolean;
  parentQuestId: number;
  sortOrder: number;
}
