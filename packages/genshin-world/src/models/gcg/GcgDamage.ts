import type { Element } from "#src/models/Element";
import type { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

// One damage a skill deals to the opposing active character: its value, and whether it is an element or no element
export interface GcgDamage {
  damageType: Element | GcgDamageKind;
  value: number;
}
