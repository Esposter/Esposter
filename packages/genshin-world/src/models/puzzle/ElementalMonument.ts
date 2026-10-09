import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Element } from "#src/models/Element";

// An Elemental Monument in the world: the element it is lit by, the elements and reactions that reach it, kept in its own
// Elemental state, and whether it is lit. A timed monument goes out a while after it was lit, and an untimed one stays lit
// Once lit. Its clock is its elemental state's, and litSeconds is the clock's reading when it was last lit
export interface ElementalMonument {
  element: Element;
  elementalState: ElementalState;
  isLit: boolean;
  isTimed: boolean;
  litSeconds: number;
}
