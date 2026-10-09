// The fields read off one row of the game's cook recipe table: its id, its rarity in stars, its ingredients with their
// Counts (a slot the recipe leaves empty has count zero), its three results by quality in the table's order, its maximum
// Proficiency, its zone parameters, its cook method, the text hash of its name, and whether it is known from the start
export interface CookRecipeRow {
  cookMethod: string;
  id: number;
  inputVec: { count: number; id: number }[];
  isDefaultUnlocked: boolean;
  maxProficiency: number;
  nameTextMapHash: number;
  qteParam: string;
  qualityOutputVec: { count: number; id: number }[];
  rankLevel: number;
}
