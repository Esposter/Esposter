// The fields read off one row of the game's viewpoint codex: its id, its name by text hash, its order in the codex and
// whether the codex has left it out
export interface ExcelViewCodexRow {
  id: number;
  isDisuse: boolean;
  nameTextMapHash: number;
  sortOrder: number;
}
