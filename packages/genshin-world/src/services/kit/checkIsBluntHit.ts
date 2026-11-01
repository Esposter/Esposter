import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";

// Whether a kit hit is a blunt attack, as the wiki's Blunt Attacks reads it and as Shatter, the Rock seal and the Ores
// Take it. A hit's own record says so, the builder having read it off the wiki for its action, its wielder's weapon and
// Its element. A hit naming no element of its own deals its wielder's, and is blunt as a Geo wielder's Geo is
export const checkIsBluntHit = (combatant: Pick<Combatant, "element">, hit: KitHit): boolean =>
  hit.isBlunt === true || (hit.element === undefined && getKitHitElement(hit, combatant) === Element.Geo);
