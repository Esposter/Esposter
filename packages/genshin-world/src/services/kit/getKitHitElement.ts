import type { Element } from "#src/models/Element";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

// The element a kit hit deals: the one it names, else its character's if it applies a gauge, else none, as a physical
// Hit
export const getKitHitElement = (
  { element, gauge }: KitHit,
  combatant: Pick<Combatant, "element">,
): Element | undefined => element ?? (gauge === undefined ? undefined : combatant.element);
