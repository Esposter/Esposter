import type { Element } from "#src/models/Element";

// An infusion a character's normal attacks, charged attack and plunges deal the element of, for the seconds left of it
export interface KitInfusion {
  characterId: number;
  element: Element;
  // Whether the infusion converts the attacks it infuses, so each hit with a converted poise deals that instead
  isConverted?: true;
  kind: "infusion";
  secondsRemaining: number;
}
