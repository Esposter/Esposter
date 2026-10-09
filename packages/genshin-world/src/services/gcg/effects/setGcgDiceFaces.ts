import type { Element } from "#src/models/Element";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// Sets the first dice a side rolled to one element, as a roll-phase effect guarantees them
export const setGcgDiceFaces = (side: GcgSideState, element: Element, count: number): void => {
  for (let index = 0; index < Math.min(count, side.dice.length); index++) side.dice[index] = element;
};
