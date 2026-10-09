import type { Element, GcgCardKind, GcgCost, GcgSkillKind } from "genshin-world";

// A card of the tutorial deck or a card its skills create, as the slice writes it: its id, its kind, its cost and the
// Effect names of its skills
export interface GcgTutorialCard {
  costs: GcgCost[];
  effects: string[];
  id: number;
  kind: GcgCardKind;
}

// A character of the tutorial deck as the slice writes it: its element, HP and energy, its weapon's kind and its skills
export interface GcgTutorialCharacter {
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  skills: GcgTutorialSkill[];
  weapon: string;
}

export interface GcgTutorialSkill {
  costs: GcgCost[];
  effect: string;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}

// The tutorial deck's slice: its cards in order, its characters in order, and the cards the tutorial's own characters
// Create on the field, which a duel needs as cards of their own
export interface GcgTutorialDeck {
  cardIds: number[];
  cards: GcgTutorialCard[];
  characterIds: number[];
  characters: GcgTutorialCharacter[];
}
