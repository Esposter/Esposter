import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit of an element landed on an enemy: the element it was dealt as, and the combatant that dealt it
export interface KitElementalHitEvent {
  element: Element;
  enemy: Enemy;
  kind: KitEventKind.ElementalHit;
  striker: Combatant;
}
