import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";

import { DishTarget } from "#src/models/cooking/DishTarget";
import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(useInventoryEntry, () => {
  const DISH_ID = 108_011;
  const ENTRY_ID = 1;
  const EATER_ID = 10_001;
  const MAX_HEALTH = 1000;
  const dishUse: DishUse = { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected };
  const createInventory = (category: ItemCategory): Inventory => ({
    items: [
      {
        definition: { category, id: DISH_ID, name: "", rank: 0, rarity: 0, stackLimit: 99 },
        id: ENTRY_ID,
        quantity: 1,
      },
    ],
    nextId: 2,
  });
  const createContext = (dishUseMap: ReadonlyMap<number, DishUse>, party = createParty([EATER_ID])) => ({
    dishUseMap,
    eaterId: EATER_ID,
    getMaxHealth: () => MAX_HEALTH,
    kitEffectState: { effects: [] },
    party,
  });

  test("a food is eaten through its dish's use", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    const inventory = useInventoryEntry(
      createInventory(ItemCategory.Food),
      ENTRY_ID,
      createContext(new Map([[DISH_ID, dishUse]]), party),
    );

    expect(inventory?.items).toStrictEqual([]);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a kind with no use yet is refused", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;

    expect(
      useInventoryEntry(
        createInventory(ItemCategory.Material),
        ENTRY_ID,
        createContext(new Map([[DISH_ID, dishUse]]), party),
      ),
    ).toBeUndefined();
    expect(getPartyMember(party, EATER_ID).healthShare).toBe(0.5);
  });

  test("a food the dish table gives no use is refused", () => {
    expect.hasAssertions();

    expect(useInventoryEntry(createInventory(ItemCategory.Food), ENTRY_ID, createContext(new Map()))).toBeUndefined();
  });
});
