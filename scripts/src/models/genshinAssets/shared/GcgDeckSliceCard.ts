import type { GcgCardKind, GcgCost } from "genshin-world";

// A card of a deck or a card its skills create, as the slice writes it: its id, its name and description text ids, its
// Kind, its cost and the effect names of its skills
export interface GcgDeckSliceCard {
  costs: GcgCost[];
  descriptionTextId: number;
  effects: string[];
  id: number;
  isCompanion?: boolean;
  isLocation: boolean;
  kind: GcgCardKind;
  nameTextId: number;
  weapon?: string;
}
