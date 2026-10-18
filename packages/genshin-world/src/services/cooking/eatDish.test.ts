import type { Inventory } from "#src/models/inventory/Inventory";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { DishTarget } from "#src/models/cooking/DishTarget";
import { eatDish } from "#src/services/cooking/eatDish";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(eatDish, () => {
  const DISH_ID = 108_011;
  const EATER_ID = 10_001;
  const ALLY_ID = 10_002;
  const MAX_HEALTH = 1000;
  const getMaxHealth = () => MAX_HEALTH;
  const createInventory = (quantity: number): Inventory => ({
    items: [
      {
        definition: { category: ItemCategory.Food, id: DISH_ID, name: "", rank: 0, rarity: 0, stackLimit: 99 },
        id: 1,
        quantity,
      },
    ],
    nextId: 2,
    quickSwapItemIds: [],
  });

  test("using a recovery dish heals the selected character", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID, ALLY_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    getPartyMember(party, ALLY_ID).healthShare = 0.5;
    const inventory = eatDish(
      createInventory(2),
      DISH_ID,
      { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
    );

    expect(countInventoryItem(inventory?.items ?? [], DISH_ID)).toBe(1);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
    expect(getPartyMember(party, ALLY_ID).healthShare).toBe(0.5);
  });

  test("using a party dish heals every party member", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID, ALLY_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    getPartyMember(party, ALLY_ID).healthShare = 0.5;
    eatDish(
      createInventory(1),
      DISH_ID,
      { heal: { flat: 100, healthShare: 0.1 }, target: DishTarget.Party },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
    );

    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
    expect(getPartyMember(party, ALLY_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a heal stops at full health", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.9;
    eatDish(
      createInventory(1),
      DISH_ID,
      { heal: { flat: 0, healthShare: 0.3 }, target: DishTarget.Selected },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
    );

    expect(getPartyMember(party, EATER_ID).healthShare).toBe(1);
  });

  test("a revive dish revives a fallen party member", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0;
    eatDish(
      createInventory(1),
      DISH_ID,
      { revive: { flat: 500 }, target: DishTarget.Selected },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
    );

    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.5);
  });

  test("a food with none in the bag cannot be used", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;

    expect(
      eatDish(
        createInventory(0),
        DISH_ID,
        { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected },
        { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
      ),
    ).toBeUndefined();
    expect(getPartyMember(party, EATER_ID).healthShare).toBe(0.5);
  });

  test("a heal dish heals the one who eats it", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID, ALLY_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    getPartyMember(party, ALLY_ID).healthShare = 0.5;
    eatDish(
      createInventory(1),
      DISH_ID,
      { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState: { effects: [] }, party },
    );

    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
    expect(getPartyMember(party, ALLY_ID).healthShare).toBe(0.5);
  });

  test("a bonus dish lasts as its description says", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    eatDish(
      createInventory(1),
      DISH_ID,
      {
        bonus: {
          attributes: [{ amount: 0.06, attribute: Attribute.CriticalRate }],
          seconds: 300,
          source: "Critical_Team",
        },
        target: DishTarget.Selected,
      },
      { eaterId: EATER_ID, getMaxHealth, kitEffectState, party: createParty([EATER_ID]) },
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.06,
        attribute: Attribute.CriticalRate,
        characterId: EATER_ID,
        kind: "buff",
        secondsRemaining: 300,
        source: "Critical_Team",
      },
    ]);
  });
});
