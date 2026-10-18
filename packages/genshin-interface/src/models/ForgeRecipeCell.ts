// One recipe the forge lists: the game's id for it, its name in the reader's language, its forge time in the game's words
// And whether the player may pick it: its Adventure Rank reached, and learned from its diagram where one opens it
export interface ForgeRecipeCell {
  forgeTimeLabel: string;
  id: number;
  isOpen: boolean;
  name: string;
}
