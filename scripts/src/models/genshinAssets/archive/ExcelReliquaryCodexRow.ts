// The fields read off one row of the game's artifact codex: the artifact set it lists and its order in the codex. A set
// has a row for each of its levels, so a set is listed once, under the first of its rows
export interface ExcelReliquaryCodexRow {
  sortOrder: number;
  suitId: number;
}
