import type { Kit } from "#src/models/kit/Kit";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { WeaponPassiveNameTextIdCreateModuleMap } from "#src/services/weapon/WeaponPassiveNameTextIdCreateModuleMap";

// A character's kit with its weapon's passive answering beside it: the module of the passive the weapon's table names,
// Built from the numbers of the rank the weapon holds, read as the kit's own passives are. A weapon whose passive has no
// Module, or a weapon with no passive, leaves the kit as it is
export const getWeaponPassiveKit = (kit: Kit, weapon: Weapon, weaponData: undefined | WeaponData): Kit => {
  const createModule = weaponData && WeaponPassiveNameTextIdCreateModuleMap[weaponData.passiveNameTextId];
  const params = weaponData?.passiveRankParams[weapon.refinement - 1];
  if (!createModule || !params) return kit;
  const passive = createModule(params);
  return {
    ...kit,
    getPassiveBonuses: (combatant, healthShare) => [
      ...(kit.getPassiveBonuses?.(combatant, healthShare) ?? []),
      ...(passive.getPassiveBonuses?.(combatant, healthShare) ?? []),
    ],
    getStrikeDamageBonus: (strike, enemy, party) =>
      (kit.getStrikeDamageBonus?.(strike, enemy, party) ?? 0) +
      (passive.getStrikeDamageBonus?.(strike, enemy, party) ?? 0),
    getStrikeAdditiveBaseDamageBonus: (strike, enemy, party, effects) =>
      (kit.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects) ?? 0) +
      (passive.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, party, effects) ?? 0),
    getStrikeCriticalRateBonus: (strike, enemy, party, effects) =>
      (kit.getStrikeCriticalRateBonus?.(strike, enemy, party, effects) ?? 0) +
      (passive.getStrikeCriticalRateBonus?.(strike, enemy, party, effects) ?? 0),
    onKitEvent: (event, context, combatant) => {
      kit.onKitEvent?.(event, context, combatant);
      passive.onKitEvent?.(event, context, combatant);
    },
  };
};
