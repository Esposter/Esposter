// The fields read off one row of the game's animal description table: the description an animal's codex row is filed under,
// And the name of the animal it describes by text hash
export interface ExcelAnimalDescribeRow {
  id: number;
  nameTextMapHash: number;
}
