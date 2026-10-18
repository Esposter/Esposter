// One entry the crafting bench lists, a recipe, a crafter or a tab: the game's id for it and its name in the reader's
// Language. A recipe carries the count the player has crafted so far
export interface CraftingCell {
  count?: number;
  id: number;
  name: string;
}
