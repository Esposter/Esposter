import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { checkIsMeleeHit } from "#src/services/kit/checkIsMeleeHit";

// The hit an ore takes from a hit a step landed for the character on the field, read before an infusion copies it, blunt
// And melee by the kit's rules
export const readOreHit = (combatant: Combatant, hit: KitHit): OreHit => ({
  hitArea: hit.hitArea,
  isBlunt: checkIsBluntHit(combatant, hit),
  isMelee: checkIsMeleeHit(combatant, hit),
  poiseDamage: hit.poiseDamage,
});
