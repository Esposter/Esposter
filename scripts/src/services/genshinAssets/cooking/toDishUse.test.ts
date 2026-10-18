import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  ADD_SERVER_BUFF_USE_OP,
  ANTI_COLD_ABILITY_NAME,
  HEAL_BUFF_ABILITY_NAME,
  REVIVE_BUFF_ABILITY_NAME,
} from "#src/services/genshinAssets/cooking/constants";
import { toDishUse } from "#src/services/genshinAssets/cooking/toDishUse";
import { Attribute, DishTarget } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toDishUse, () => {
  const BONUS_ATTACK_ABILITY_NAME = "Atk_Team";
  const BONUS_CRITICAL_ABILITY_NAME = "Critical_Team";
  const BUFF_ID = 1;
  const DISH_ID = 10;
  const createRow = (overrides: Partial<MaterialRow> = {}): MaterialRow => ({
    foodQuality: "FOOD_QUALITY_DELICIOUS",
    id: DISH_ID,
    itemUse: [{ useOp: ADD_SERVER_BUFF_USE_OP, useParam: [String(BUFF_ID)] }],
    nameTextMapHash: 0,
    rank: 0,
    rankLevel: 1,
    stackLimit: 1,
    useTarget: "ITEM_USE_TARGET_CUR_TEAM",
    ...overrides,
  });
  const createBuff = (desc: string, abilityName = HEAL_BUFF_ABILITY_NAME, time = 0): BuffRow => ({
    abilityName,
    desc,
    serverBuffId: BUFF_ID,
    time,
  });

  test("should read a heal dish's share of Max HP, flat amount and the party it reaches", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("8%+800")])).toStrictEqual({
      heal: { flat: 800, healthShare: 0.08 },
      target: DishTarget.Party,
    });
  });

  test("should give no use to a dish whose item heals nothing", () => {
    expect.hasAssertions();

    const row = createRow({ itemUse: [{ useOp: "ITEM_USE_RELIVE_AVATAR", useParam: [] }] });

    expect(toDishUse(row, [createBuff("8%+800")])).toBeUndefined();
  });

  test("should read the leading heal of a description that lists alternatives in parentheses", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("30%+600（24%+450；36%+700）")])).toStrictEqual({
      heal: { flat: 600, healthShare: 0.3 },
      target: DishTarget.Party,
    });
  });

  test("should read a revive dish's HP restored and the fallen character it reaches", () => {
    expect.hasAssertions();

    const row = createRow({ useTarget: "ITEM_USE_TARGET_SPECIFY_DEAD_AVATAR" });

    expect(toDishUse(row, [createBuff("恢复500HP", REVIVE_BUFF_ABILITY_NAME)])).toStrictEqual({
      revive: { flat: 500 },
      target: DishTarget.Selected,
    });
  });

  test("should read a bonus dish's flat attack and critical rate, and how long the bonus lasts", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("224+暴击率6%", BONUS_ATTACK_ABILITY_NAME, 300)])).toStrictEqual({
      bonus: {
        attributes: [
          { amount: 224, attribute: Attribute.Attack },
          { amount: 0.06, attribute: Attribute.CriticalRate },
        ],
        seconds: 300,
        source: BONUS_ATTACK_ABILITY_NAME,
      },
      target: DishTarget.Party,
    });
  });

  test("should read each clause of a bonus description, a percentage clause by its stat", () => {
    expect.hasAssertions();

    expect(
      toDishUse(createRow(), [createBuff("物理增伤提升25%，暴击6%", BONUS_CRITICAL_ABILITY_NAME, 300)])?.bonus
        ?.attributes,
    ).toStrictEqual([
      { amount: 0.25, attribute: Attribute.PhysicalDamageBonus },
      { amount: 0.06, attribute: Attribute.CriticalRate },
    ]);
  });

  test("should give no bonus to a dish whose bonus description it does not read", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("wotem", BONUS_ATTACK_ABILITY_NAME, 300)])).toBeUndefined();
  });

  test("should give no use to a dish whose heal buff is a drawback", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("loses 200HP every second")])).toBeUndefined();
  });

  test("should read an anti-cold dish's ratio and how long it holds the fill down", () => {
    expect.hasAssertions();

    expect(
      toDishUse(createRow(), [createBuff("用于抗寒料理，能够抑制低温条提升，ratio-0.3", ANTI_COLD_ABILITY_NAME, 900)]),
    ).toStrictEqual({ antiCold: { ratio: -0.3, seconds: 900 }, target: DishTarget.Party });
  });
});
