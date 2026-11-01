import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { DishTarget } from "#src/models/cooking/DishTarget";
import { eatDish } from "#src/services/cooking/eatDish";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ItemCategory } from "genshin-interface";
import { assert, beforeEach, describe, expect, test } from "vitest";

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
  let kitEffectState: KitEffectState;
  let party: Party;

  beforeEach(() => {
    kitEffectState = { effects: [] };
    party = createParty([EATER_ID, ALLY_ID]);
  });

  const eat = (inventory: Inventory, dishUse: DishUse, count = 1) =>
    eatDish(inventory, DISH_ID, dishUse, { count, eaterId: EATER_ID, getMaxHealth, kitEffectState, party });

  test("using a recovery dish heals the selected character", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.5;
    getPartyMember(party, ALLY_ID).healthShare = 0.5;
    const inventory = eat(createInventory(2), { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected });

    expect(countInventoryItem(inventory?.items ?? [], DISH_ID)).toBe(1);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
    expect(getPartyMember(party, ALLY_ID).healthShare).toBe(0.5);
  });

  test("using a party dish heals every party member", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.5;
    getPartyMember(party, ALLY_ID).healthShare = 0.5;
    eat(createInventory(1), { heal: { flat: 100, healthShare: 0.1 }, target: DishTarget.Party });

    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
    expect(getPartyMember(party, ALLY_ID).healthShare).toBeCloseTo(0.7);
  });

  test("eating several of a dish heals for each one eaten and takes that many", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.5;
    const inventory = eat(createInventory(3), { heal: { flat: 0, healthShare: 0.1 }, target: DishTarget.Selected }, 2);

    assert.exists(inventory);
    expect(countInventoryItem(inventory.items, DISH_ID)).toBe(1);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a count above what the bag holds eats only what it holds", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.5;
    const inventory = eat(createInventory(2), { heal: { flat: 0, healthShare: 0.1 }, target: DishTarget.Selected }, 3);

    assert.exists(inventory);
    expect(countInventoryItem(inventory.items, DISH_ID)).toBe(0);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a heal stops at full health", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.9;
    eat(createInventory(1), { heal: { flat: 0, healthShare: 0.3 }, target: DishTarget.Selected });

    expect(getPartyMember(party, EATER_ID).healthShare).toBe(1);
  });

  test("a revive dish revives a fallen party member", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0;
    eat(createInventory(1), { revive: { flat: 500 }, target: DishTarget.Selected });

    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.5);
  });

  test("a food with none in the bag cannot be used", () => {
    expect.hasAssertions();

    getPartyMember(party, EATER_ID).healthShare = 0.5;

    expect(
      eat(createInventory(0), { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected }),
    ).toBeUndefined();
    expect(getPartyMember(party, EATER_ID).healthShare).toBe(0.5);
  });

  test("an anti-cold dish holds the team's anti-cold for its seconds, restarting the one it holds", () => {
    expect.hasAssertions();

    const eatAntiCold = (antiCold: { ratio: number; seconds: number }) =>
      eat(createInventory(2), { antiCold, target: DishTarget.Party });

    eatAntiCold({ ratio: -0.3, seconds: 900 });
    eatAntiCold({ ratio: -0.5, seconds: 1500 });

    expect(kitEffectState.effects).toStrictEqual([{ kind: "antiCold", ratio: -0.5, secondsRemaining: 1500 }]);
  });

  test("a bonus dish lasts as its description says", () => {
    expect.hasAssertions();

    eat(createInventory(1), {
      bonus: {
        attributes: [{ amount: 0.06, attribute: Attribute.CriticalRate }],
        seconds: 300,
        source: "Critical_Team",
      },
      target: DishTarget.Selected,
    });

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
