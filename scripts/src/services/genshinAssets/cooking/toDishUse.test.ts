import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  ADD_SERVER_BUFF_USE_OP,
  HEAL_BUFF_ABILITY_NAME,
  REVIVE_BUFF_ABILITY_NAME,
} from "#src/services/genshinAssets/cooking/constants";
import { toDishUse } from "#src/services/genshinAssets/cooking/toDishUse";
import { DishTarget } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toDishUse, () => {
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
  const createBuff = (desc: string, abilityName = HEAL_BUFF_ABILITY_NAME): BuffRow => ({
    abilityName,
    desc,
    serverBuffId: BUFF_ID,
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

  test("should give no use to a dish whose heal buff is a drawback", () => {
    expect.hasAssertions();

    expect(toDishUse(createRow(), [createBuff("loses 200HP every second")])).toBeUndefined();
  });
});
