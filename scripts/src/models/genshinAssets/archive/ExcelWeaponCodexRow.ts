// The fields read off one row of the game's weapon codex: the weapon it lists, its order in the codex and whether the
// Codex has left it out
export interface ExcelWeaponCodexRow {
  id: number;
  isDisuse: boolean;
  sortOrder: number;
  weaponId: number;
}
