// The fields read off one row of the game's buff table: the ability it names, its description as the table writes it,
// And the server buff id a dish's item names by its first parameter
export interface BuffRow {
  abilityName: string;
  desc: string;
  serverBuffId: number;
}
