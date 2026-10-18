import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit applied an element to an enemy at the gauge its internal cooldown let through: the element, and the combatant
// That dealt the hit
export interface KitElementAppliedEvent {
  element: Element;
  enemy: Enemy;
  kind: KitEventKind.ElementApplied;
  striker: Combatant;
}
