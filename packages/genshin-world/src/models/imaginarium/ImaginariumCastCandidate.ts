import type { Element } from "#src/models/Element";

// A character a run's Alternate Cast may take: its id, its element, which the Traveler has none of, and its level
export interface ImaginariumCastCandidate {
  characterId: number;
  element?: Element;
  level: number;
}
