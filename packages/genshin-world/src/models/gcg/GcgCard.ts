import type { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import type { GcgCost } from "#src/models/gcg/GcgCost";

// A card as the duel reads it: its id, its name and description text ids (the words are in the card game's chunk), its
// Kind, what playing it costs and the effect names the game gives its skills
export interface GcgCard {
  costs: GcgCost[];
  descriptionTextId: number;
  effects: string[];
  id: number;
  // Whether a support card is a Companion Support Card, as the dump's ally tag marks it, and absent for other cards
  isCompanion?: boolean;
  isLocation: boolean;
  kind: GcgCardKind;
  nameTextId: number;
  // The weapon kind a weapon card names, as a character's weapon is named (the tag's suffix), and no weapon for other cards
  weapon?: string;
}
