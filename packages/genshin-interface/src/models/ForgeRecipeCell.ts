// One recipe the forge lists: the game's id for it, its name in the reader's language, its forge time in the game's words
// And whether the player has learned it from its diagram
export interface ForgeRecipeCell {
  forgeTimeLabel: string;
  id: number;
  isLearned: boolean;
  name: string;
}
