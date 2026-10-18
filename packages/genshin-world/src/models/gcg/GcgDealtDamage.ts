import type { Element } from "#src/models/Element";
import type { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import type { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";

// One hit a damage landed on a standing character: the element or kind it hit with, and the reaction its element made with
// The aura there, when it made one
export interface GcgDealtDamage {
  damageType: Element | GcgDamageKind;
  reaction?: GcgReactionKind;
}
