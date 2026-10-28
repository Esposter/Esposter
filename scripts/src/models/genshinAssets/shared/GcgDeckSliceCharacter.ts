import type { GcgDeckSliceSkill } from "#src/models/genshinAssets/shared/GcgDeckSliceSkill";
import type { Element } from "genshin-world";

// A character of a deck as the slice writes it: its id, its name and description text ids, its element, HP and energy,
// Its weapon's kind and its skills
export interface GcgDeckSliceCharacter {
  descriptionTextId: number;
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  nameTextId: number;
  nation?: string;
  skills: GcgDeckSliceSkill[];
  weapon: string;
}
