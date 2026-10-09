import type { Element } from "#src/models/Element";

// An infusion a character's normal attacks, charged attack and plunges deal the element of, for the seconds left of it
export interface KitInfusion {
  characterId: number;
  element: Element;
  kind: "infusion";
  secondsRemaining: number;
}
