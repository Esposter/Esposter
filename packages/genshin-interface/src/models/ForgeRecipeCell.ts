// One recipe the forge lists: the game's id for it and its name in the reader's language.
// Its forge time is the game's words.
// Whether the player may pick it depends on its Adventure Rank being reached.
// Where its diagram opens it, that diagram must also be learned.
export interface ForgeRecipeCell {
  forgeTimeLabel: string;
  id: number;
  isOpen: boolean;
  name: string;
}
