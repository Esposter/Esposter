// The fields read off one row of the game's monster description table: the description a monster's row and codex row
// Are filed under, and the text hash of the name the description gives the monster
export interface ExcelMonsterDescribeRow {
  id: number;
  nameTextMapHash: number;
}
