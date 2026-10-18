import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponAscensionPhase } from "#src/models/weapon/WeaponAscensionPhase";
import type { WeaponData } from "#src/models/weapon/WeaponData";

// The phase a weapon ascends into, if it can ascend now: it sits at its current phase's level cap and a next phase exists.
// The offer and the ascension both read it, so neither can be allowed a case the other refuses
export const getAscendableNextPhase = (weapon: Weapon, weaponData: WeaponData): undefined | WeaponAscensionPhase => {
  const phase = weaponData.ascensionPhases[weapon.ascension];
  const nextPhase = weaponData.ascensionPhases[weapon.ascension + 1];
  return phase && nextPhase && weapon.level === phase.maxLevel ? nextPhase : undefined;
};
