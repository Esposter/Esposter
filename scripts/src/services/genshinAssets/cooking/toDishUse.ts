import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { DishUse } from "genshin-world";

import {
  ADD_SERVER_BUFF_USE_OP,
  DISH_TARGET_MAP,
  HEAL_BUFF_ABILITY_NAME,
  HEAL_BUFF_DESCRIPTION_REGEX,
  HEAL_PERCENT_TOTAL,
  REVIVE_BUFF_ABILITY_NAME,
  REVIVE_BUFF_DESCRIPTION_REGEX,
} from "#src/services/genshinAssets/cooking/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The buffs of one ability a dish's item adds when used, in the order its uses name them
const getBuffs = (materialRow: MaterialRow, buffRows: BuffRow[], abilityName: string): BuffRow[] =>
  materialRow.itemUse
    .filter(({ useOp }) => useOp === ADD_SERVER_BUFF_USE_OP)
    .flatMap(({ useParam }) =>
      buffRows.filter((buff) => buff.abilityName === abilityName && String(buff.serverBuffId) === useParam[0]),
    );

// The heal a description leads with, as the share of Max HP and the flat amount it writes. A description that is no heal
// Form is a drawback the dish gives instead, so it has none
const toHeal = (description: string): DishUse["heal"] => {
  const match = HEAL_BUFF_DESCRIPTION_REGEX.exec(description);
  if (match?.groups === undefined) return undefined;
  return { flat: Number(match.groups.flat), healthShare: Number(match.groups.percent) / HEAL_PERCENT_TOTAL };
};

// The HP a revive description restores, which every revive writes in the one form
const toRevive = (materialRow: MaterialRow, description: string): DishUse["revive"] => {
  const match = REVIVE_BUFF_DESCRIPTION_REGEX.exec(description);
  if (match?.groups === undefined)
    throw new InvalidOperationError(Operation.Read, String(materialRow.id), "names a revive this build does not read");
  return { flat: Number(match.groups.flat) };
};

// A dish's use from its item row and the buff table: the heal its heal buff gives and the HP its revive buff restores,
// And the target its use names. A dish whose buffs give neither has no use. A dish with more than one buff of a kind, or
// Or a target this does not read, throws
export const toDishUse = (materialRow: MaterialRow, buffRows: BuffRow[]): DishUse | undefined => {
  const [healBuff, ...otherHealBuffs] = getBuffs(materialRow, buffRows, HEAL_BUFF_ABILITY_NAME);
  const [reviveBuff, ...otherReviveBuffs] = getBuffs(materialRow, buffRows, REVIVE_BUFF_ABILITY_NAME);
  const heal = healBuff === undefined ? undefined : toHeal(healBuff.desc);
  const revive = reviveBuff === undefined ? undefined : toRevive(materialRow, reviveBuff.desc);
  if (heal === undefined && revive === undefined) return undefined;
  const target = DISH_TARGET_MAP[materialRow.useTarget ?? ""];
  if (otherHealBuffs.length > 0 || otherReviveBuffs.length > 0 || target === undefined)
    throw new InvalidOperationError(Operation.Read, String(materialRow.id), "names a use this build does not read");
  return { ...(heal === undefined ? {} : { heal }), ...(revive === undefined ? {} : { revive }), target };
};
