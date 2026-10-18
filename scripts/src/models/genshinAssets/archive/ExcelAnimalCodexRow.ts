// The fields read off one row of the game's living beings codex: its id, the description it is filed under, its kind as
// The codex spells it (left out for an animal, the codex's first kind, as the dump writes no field at its default), its
// Order in the codex and whether the codex has left it out
export interface ExcelAnimalCodexRow {
  describeId: number;
  id: number;
  isDisuse: boolean;
  sortOrder: number;
  type?: string;
}
