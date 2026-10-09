import type { Element, GcgCardKind, GcgCost, GcgSkillKind } from "genshin-world";

// A deck's slice: its cards in order, its characters in order, and the card ids the deck holds, a card once per copy
export interface GcgDeckSlice {
  cardIds: number[];
  cards: GcgDeckSliceCard[];
  characterIds: number[];
  characters: GcgDeckSliceCharacter[];
}

// A card of a deck or a card its skills create, as the slice writes it: its id, its name and description text ids, its
// Kind, its cost and the effect names of its skills
export interface GcgDeckSliceCard {
  costs: GcgCost[];
  descriptionTextId: number;
  effects: string[];
  id: number;
  isLocation: boolean;
  kind: GcgCardKind;
  nameTextId: number;
}

// A character of a deck as the slice writes it: its id, its name and description text ids, its element, HP and energy,
// Its weapon's kind and its skills
export interface GcgDeckSliceCharacter {
  descriptionTextId: number;
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  nameTextId: number;
  skills: GcgDeckSliceSkill[];
  weapon: string;
}

export interface GcgDeckSliceSkill {
  costs: GcgCost[];
  effect: string;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}
