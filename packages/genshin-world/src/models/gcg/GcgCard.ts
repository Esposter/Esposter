import type { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import type { GcgCost } from "#src/models/gcg/GcgCost";

// A card as the duel reads it: its id, its name and description text ids (the words are in the card game's chunk), its
// Kind, what playing it costs and the effect names the game gives its skills
export interface GcgCard {
  costs: GcgCost[];
  descriptionTextId: number;
  effects: string[];
  id: number;
  isLocation: boolean;
  kind: GcgCardKind;
  nameTextId: number;
}
