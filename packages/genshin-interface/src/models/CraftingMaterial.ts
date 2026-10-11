// A material a recipe takes, with how many the player holds and how many one craft takes
export interface CraftingMaterial {
  id: number;
  owned: number;
  required: number;
}
