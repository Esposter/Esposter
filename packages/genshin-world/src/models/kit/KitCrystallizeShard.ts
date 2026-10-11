import type { Element } from "#src/models/Element";
import type { GroundPoint } from "genshin-engine";

// A Crystallize shard on the ground where a Crystallize dropped it, which the character on the field picks up by walking
// Within reach of it once it may be: the character that crystallized it, the element and health of the Crystallize
// Shield it grants, and the seconds it lies, counted from the reaction
export interface KitCrystallizeShard {
  characterId: number;
  element: Element;
  health: number;
  kind: "crystallizeShard";
  position: GroundPoint;
  secondsRemaining: number;
}
