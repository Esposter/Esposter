import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { Attribute, DishBonus, DishUse } from "genshin-world";

import {
  ADD_SERVER_BUFF_USE_OP,
  ANTI_COLD_ABILITY_NAME,
  ANTI_COLD_DESCRIPTION_REGEX,
  BONUS_ABILITY_NAMES,
  BONUS_CLAUSE_ATTRIBUTE_MAP,
  BONUS_CLAUSE_SEPARATOR_REGEX,
  BONUS_FLAT_ATTRIBUTE_MAP,
  BONUS_FLAT_CLAUSE_REGEX,
  BONUS_PERCENT_CLAUSE_REGEX,
  DISH_TARGET_MAP,
  HEAL_BUFF_ABILITY_NAME,
  HEAL_BUFF_DESCRIPTION_REGEX,
  PERCENT_TOTAL,
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
  return { flat: Number(match.groups.flat), healthShare: Number(match.groups.percent) / PERCENT_TOTAL };
};

// The HP a revive description restores, which every revive writes in the one form
const toRevive = (materialRow: MaterialRow, description: string): DishUse["revive"] => {
  const match = REVIVE_BUFF_DESCRIPTION_REGEX.exec(description);
  if (match?.groups === undefined)
    throw new InvalidOperationError(Operation.Read, String(materialRow.id), "names a revive this build does not read");
  return { flat: Number(match.groups.flat) };
};

// The stat one clause of a bonus description gives: a flat amount of the attribute its ability names, or a percentage of
// The attribute its name gives, kept as a fraction. A clause this does not read gives none
const toBonusClause = (
  clause: string,
  flatAttribute: Attribute | undefined,
): DishBonus["attributes"][number] | undefined => {
  const flatMatch = BONUS_FLAT_CLAUSE_REGEX.exec(clause);
  if (flatMatch?.groups)
    return flatAttribute === undefined
      ? undefined
      : { amount: Number(flatMatch.groups.flat), attribute: flatAttribute };
  const percentMatch = BONUS_PERCENT_CLAUSE_REGEX.exec(clause);
  if (percentMatch?.groups === undefined) return undefined;
  const { name } = percentMatch.groups;
  const attribute = name === undefined ? undefined : BONUS_CLAUSE_ATTRIBUTE_MAP[name];
  return attribute === undefined
    ? undefined
    : { amount: Number(percentMatch.groups.percent) / PERCENT_TOTAL, attribute };
};

// The bonus a bonus buff's description gives, each clause one stat, with the seconds the buff lasts. A description with a
// Clause this does not read gives no bonus
const toBonus = (buff: BuffRow): DishBonus | undefined => {
  const flatAttribute = BONUS_FLAT_ATTRIBUTE_MAP[buff.abilityName];
  const attributes: DishBonus["attributes"] = [];
  for (const clause of buff.desc.split(BONUS_CLAUSE_SEPARATOR_REGEX)) {
    const attribute = toBonusClause(clause, flatAttribute);
    if (attribute === undefined) return undefined;
    attributes.push(attribute);
  }
  return { attributes, seconds: buff.time, source: buff.abilityName };
};

// The ratio an anti-cold buff's description writes, which holds the fill down by it for the seconds the buff lasts. A
// Description that writes none is a drawback the dish gives instead, so it has none
const toAntiCold = (buff: BuffRow): DishUse["antiCold"] => {
  const match = ANTI_COLD_DESCRIPTION_REGEX.exec(buff.desc);
  if (match?.groups === undefined) return undefined;
  return { ratio: Number(match.groups.ratio), seconds: buff.time };
};

// A dish's use from its item row and the buff table: the heal its heal buff gives, the HP its revive buff restores and the
// Bonus its bonus buff gives, the ratio its anti-cold buff holds the fill down by, and the target its use names. A dish whose buffs give none of these has no use. A dish with
// More than one buff of a kind, or a target this does not read, throws
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
