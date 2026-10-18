// The fields read off one row of the game's cook recipe table: its id, its rarity in stars, its kind of dish as the table
// Spells it, its ingredients with their counts (a slot the recipe leaves empty has count zero), its three results by
// Quality in the table's order, its maximum proficiency, its zone parameters, its cook method, the text hash of its name,
// And whether it is known from the start
export interface CookRecipeRow {
  cookMethod: string;
  foodType: string;
  id: number;
  inputVec: { count: number; id: number }[];
  isDefaultUnlocked: boolean;
  maxProficiency: number;
  nameTextMapHash: number;
  qteParam: string;
  qualityOutputVec: { count: number; id: number }[];
  rankLevel: number;
}
