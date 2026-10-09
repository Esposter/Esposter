// The fields read off one row of the game's material codex: the material it lists, its order in the codex and whether the
// Codex has left it out
export interface ExcelMaterialCodexRow {
  isDisuse: boolean;
  materialId: number;
  sortOrder: number;
}
