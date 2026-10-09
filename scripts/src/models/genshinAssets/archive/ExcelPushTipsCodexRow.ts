// The fields read off one row of the game's push tips codex: its id, the push tip it is filed under, its order in the
// Codex and whether the codex has left it out
export interface ExcelPushTipsCodexRow {
  id: number;
  isDisuse: boolean;
  pushTipId: number;
  sortOrder: number;
}
