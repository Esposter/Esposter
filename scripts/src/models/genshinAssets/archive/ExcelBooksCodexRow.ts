// The fields read off one row of the game's books codex: its id, the book's material whose name it shows, its order in the
// Codex and whether the codex has left it out
export interface ExcelBooksCodexRow {
  id: number;
  isDisuse: boolean;
  materialId: number;
  sortOrder: number;
}
