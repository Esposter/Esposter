// The fields read off one row of the game's combine table: its id, its combine type and recipe type, its materials with
// Their counts, the Mora it costs, the Adventure Rank it needs, its result and the count it makes, and whether the bench
// Shows it from the start. A material slot the recipe leaves empty has id zero
export interface ExcelCombineRow {
  combineId: number;
  combineType: number;
  isDefaultShow: boolean;
  materialItems: { count: number; id: number }[];
  playerLevel: number;
  recipeType: string;
  resultItemCount: number;
  resultItemId: number;
  scoinCost: number;
}
