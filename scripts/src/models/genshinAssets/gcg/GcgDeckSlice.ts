import type { Element, GcgCardKind, GcgCost, GcgSkillKind } from "genshin-world";

// A card of a deck or a card its skills create, as the slice writes it: its id, its kind, its cost and the
// Effect names of its skills
export interface GcgDeckSliceCard {
  costs: GcgCost[];
  effects: string[];
  id: number;
  kind: GcgCardKind;
}

// A character of a deck as the slice writes it: its element, HP and energy, its weapon's kind and its skills
export interface GcgDeckSliceCharacter {
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  skills: GcgDeckSliceSkill[];
  weapon: string;
}

// A deck's slice: its cards in order, its characters in order, and the card ids the deck holds, a card once per copy
export interface GcgDeckSlice {
  cardIds: number[];
  cards: GcgDeckSliceCard[];
  characterIds: number[];
  characters: GcgDeckSliceCharacter[];
}

export interface GcgDeckSliceSkill {
  costs: GcgCost[];
  effect: string;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}
