import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { WeaponType } from "#src/models/weapon/WeaponType";

const MELEE_WEAPON_TYPES = new Set<WeaponType>([WeaponType.Claymore, WeaponType.Polearm, WeaponType.Sword]);

// The hits an ore takes from the hits a step landed for the character on the field, read before an infusion copies them. A
// Hit is melee when it is a normal or charged attack of a character wielding a sword, a claymore or a polearm
export const readOreHits = ({ kit, weaponType }: Combatant, landedHits: KitHit[]): OreHit[] => {
  const isMeleeWeapon = weaponType !== undefined && MELEE_WEAPON_TYPES.has(weaponType);
  const attackHits = new Set<KitHit>([...kit.normalAttacks.flatMap(({ hits }) => hits), ...kit.chargedAttack.hits]);
  return landedHits.map((hit) => ({
    hitArea: hit.hitArea,
    isBlunt: hit.isBlunt === true,
    isMelee: isMeleeWeapon && attackHits.has(hit),
    poiseDamage: hit.poiseDamage,
  }));
};
