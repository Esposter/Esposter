import type { Element } from "#src/models/Element";

// The characters a Companion event offers from: its element, or any element when it names none, and how many it offers
export interface ImaginariumCompanionPool {
  element?: Element | undefined;
  offerCount: number;
}
