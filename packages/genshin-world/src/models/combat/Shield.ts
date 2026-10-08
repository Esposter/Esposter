import type { Element } from "#src/models/Element";

// A shield on a character: the damage it has left to absorb, and its element, none for an elementless one
export interface Shield {
  element?: Element;
  health: number;
}
