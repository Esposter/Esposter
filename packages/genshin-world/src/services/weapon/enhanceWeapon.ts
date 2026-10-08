import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { ENHANCEMENT_ORES, EXP_PER_MORA, FODDER_EXP_SHARE } from "#src/services/weapon/constants";
import { getRarityRequiredExps } from "#src/services/weapon/getRarityRequiredExps";
import { getWeaponInvestedExp } from "#src/services/weapon/getWeaponInvestedExp";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A weapon levelled with ores and fodder weapons, as the game takes them: each ore gives its EXP, a fodder weapon its base
// And the share of its own levelling EXP. Ten points of the EXP the weapon takes in cost a Mora, the share recovered
// From a fodder costing none. Levels are gained while the EXP holds their requirement, up to the phase's cap; past it, the
// EXP left comes back as the Enhancement Ores it fills, largest first. What is under the smallest ore is lost: the
// Provisional: the game's rule for that remainder is not known, a Recordings owed line settles it
export const enhanceWeapon = (
  weapon: Weapon,
  weaponData: WeaponData,
  rarityRequiredExpsMap: RarityRequiredExpsMap,
  wallet: Wallet,
  { fodders, ores }: { fodders: { data: WeaponData; weapon: Weapon }[]; ores: ItemCount[] },
): { returnedOres: ItemCount[]; wallet: Wallet; weapon: Weapon } => {
  const fodderPaidExp = fodders.reduce((sum, { data }) => sum + data.baseExp, 0);
  const fodderRecoveredExp = fodders.reduce(
    (sum, { data, weapon: fodderWeapon }) =>
      sum +
      Math.floor(
        getWeaponInvestedExp(fodderWeapon, getRarityRequiredExps(rarityRequiredExpsMap, data.rarity)) *
          FODDER_EXP_SHARE,
      ),
    0,
  );
  const orePaidExp = ores.reduce((sum, { count, id }) => {
    const ore = ENHANCEMENT_ORES.find((enhancementOre) => enhancementOre.id === id);
    if (!ore) throw new InvalidOperationError(Operation.Update, enhanceWeapon.name, `ore ${id}`);
    return sum + count * ore.exp;
  }, 0);
  const paidExp = fodderPaidExp + orePaidExp;
  const moraCost = Math.floor(paidExp / EXP_PER_MORA);
  if (wallet[Currency.Mora] < moraCost)
    throw new InvalidOperationError(Operation.Update, enhanceWeapon.name, `${moraCost} Mora`);
  const phaseMaxLevel = weaponData.ascensionPhases[weapon.ascension]?.maxLevel;
  if (phaseMaxLevel === undefined)
    throw new InvalidOperationError(Operation.Update, enhanceWeapon.name, `ascension ${weapon.ascension}`);
  const requiredExps = getRarityRequiredExps(rarityRequiredExpsMap, weaponData.rarity);
  let level = weapon.level;
  let experience = weapon.experience + paidExp + fodderRecoveredExp;
  while (level < phaseMaxLevel) {
    const requiredExp = requiredExps[level - 1];
    if (requiredExp === undefined)
      throw new InvalidOperationError(Operation.Update, enhanceWeapon.name, `no EXP at level ${level}`);
    if (experience < requiredExp) break;
    experience -= requiredExp;
    level++;
  }
  const isAtCap = level === phaseMaxLevel;
  let returnedExp = isAtCap ? experience : 0;
  const returnedOres: ItemCount[] = [];
  for (const { exp, id } of ENHANCEMENT_ORES) {
    const count = Math.floor(returnedExp / exp);
    if (count > 0) returnedOres.push({ count, id });
    returnedExp -= count * exp;
  }
  return {
    returnedOres,
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - moraCost },
    weapon: { ...weapon, experience: isAtCap ? 0 : experience, level },
  };
};
