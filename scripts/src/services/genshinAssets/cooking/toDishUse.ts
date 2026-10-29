import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/shared/MaterialRow";
import type { DishUse } from "genshin-world";

import {
  ANTI_COLD_ABILITY_NAME,
  BONUS_ABILITY_NAMES,
  DISH_TARGET_MAP,
  HEAL_BUFF_ABILITY_NAME,
  REVIVE_BUFF_ABILITY_NAME,
} from "#src/services/genshinAssets/cooking/constants";
import { getBuffs } from "#src/services/genshinAssets/cooking/getBuffs";
import { toAntiCold } from "#src/services/genshinAssets/cooking/toAntiCold";
import { toBonus } from "#src/services/genshinAssets/cooking/toBonus";
import { toHeal } from "#src/services/genshinAssets/cooking/toHeal";
import { toRevive } from "#src/services/genshinAssets/cooking/toRevive";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A dish's use from its item row and the buff table: the heal its heal buff gives, the HP its revive buff restores and
// The bonus its bonus buff gives, the ratio its anti-cold buff holds the fill down by, and the target its use names. A
// Dish whose buffs give none of these has no use. A dish with more than one buff of a kind, or a target this does not
// Read, throws
export const toDishUse = (materialRow: MaterialRow, buffRows: BuffRow[]): DishUse | undefined => {
  const [healBuff, ...otherHealBuffs] = getBuffs(materialRow, buffRows, HEAL_BUFF_ABILITY_NAME);
  const [reviveBuff, ...otherReviveBuffs] = getBuffs(materialRow, buffRows, REVIVE_BUFF_ABILITY_NAME);
  const [bonusBuff, ...otherBonusBuffs] = BONUS_ABILITY_NAMES.flatMap((abilityName) =>
    getBuffs(materialRow, buffRows, abilityName),
  );
  const [antiColdBuff, ...otherAntiColdBuffs] = getBuffs(materialRow, buffRows, ANTI_COLD_ABILITY_NAME);
  const heal = healBuff === undefined ? undefined : toHeal(healBuff.desc);
  const revive = reviveBuff === undefined ? undefined : toRevive(materialRow, reviveBuff.desc);
  const bonus = bonusBuff === undefined ? undefined : toBonus(bonusBuff);
  const antiCold = antiColdBuff === undefined ? undefined : toAntiCold(antiColdBuff);
  if (heal === undefined && revive === undefined && bonus === undefined && antiCold === undefined) return undefined;
  const target = DISH_TARGET_MAP[materialRow.useTarget ?? ""];
  if (
    otherHealBuffs.length > 0 ||
    otherReviveBuffs.length > 0 ||
    otherBonusBuffs.length > 0 ||
    otherAntiColdBuffs.length > 0 ||
    target === undefined
  )
    throw new InvalidOperationError(Operation.Read, String(materialRow.id), "names a use this build does not read");
  return {
    ...(antiCold === undefined ? {} : { antiCold }),
    ...(bonus === undefined ? {} : { bonus }),
    ...(heal === undefined ? {} : { heal }),
    ...(revive === undefined ? {} : { revive }),
    target,
  };
};
