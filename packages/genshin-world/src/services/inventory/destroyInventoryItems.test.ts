import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { destroyInventoryItems } from "#src/services/inventory/destroyInventoryItems";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { ItemCategory } from "genshin-interface";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

describe(destroyInventoryItems, () => {
  const ORE_ID = 104_011;
  const MORA_ID = 202;
  const ORE_STACK_LIMIT = 99_999;

  const createWeapon = (id: number, rarity: number, destroyRule: DestroyRule): InventoryItem => ({
    definition: {
      category: ItemCategory.Weapon,
      destroyReturnMaterial: destroyRule === DestroyRule.ReturnMaterial ? ORE_ID : 0,
      destroyReturnMaterialCount: destroyRule === DestroyRule.ReturnMaterial ? rarity : 0,
      destroyRule,
      id: 11_101,
      name: "",
      rank: 0,
      rarity,
      stackLimit: 1,
    },
    id,
    level: 1,
    quantity: 1,
  });

  test("destroys a 3-star weapon and returns its enhancement ore into the bag", () => {
    expect.hasAssertions();

    const weapon = createWeapon(0, 3, DestroyRule.ReturnMaterial);

    expect(
      destroyInventoryItems(
        { items: [weapon], nextId: 1 },
        EMPTY_WALLET,
        [weapon.id],
        englishNameText,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: {
        items: [{ definition: getItemDefinition(ORE_ID, englishNameText, materialDataMap), id: 1, quantity: 3 }],
        nextId: 2,
      },
      wallet: EMPTY_WALLET,
    });
  });

  test("returns an entry chosen twice once", () => {
    expect.hasAssertions();

    const weapon = createWeapon(0, 3, DestroyRule.ReturnMaterial);

    expect(
      destroyInventoryItems(
        { items: [weapon], nextId: 1 },
        EMPTY_WALLET,
        [weapon.id, weapon.id],
        englishNameText,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: {
        items: [{ definition: getItemDefinition(ORE_ID, englishNameText, materialDataMap), id: 1, quantity: 3 }],
        nextId: 2,
      },
      wallet: EMPTY_WALLET,
    });
  });

  test("returns Mora into the wallet rather than the bag", () => {
    expect.hasAssertions();

    const artifact: InventoryItem = {
      definition: {
        category: ItemCategory.Artifact,
        destroyReturnMaterial: MORA_ID,
        destroyReturnMaterialCount: 420,
        destroyRule: DestroyRule.ReturnMaterial,
        id: 20_002,
        name: "",
        rank: 0,
        rarity: 1,
        stackLimit: 1,
      },
      id: 0,
      level: 0,
      quantity: 1,
    };

    expect(
      destroyInventoryItems(
        { items: [artifact], nextId: 1 },
        EMPTY_WALLET,
        [artifact.id],
        englishNameText,
        materialDataMap,
      ),
    ).toStrictEqual({ inventory: { items: [], nextId: 1 }, wallet: { ...EMPTY_WALLET, [Currency.Mora]: 420 } });
  });

  test("refuses the whole destruction when a chosen weapon is 4-star, which its rule never destroys", () => {
    expect.hasAssertions();

    const weapon = createWeapon(0, 3, DestroyRule.ReturnMaterial);
    const fourStarWeapon = createWeapon(1, 4, DestroyRule.None);

    expect(() =>
      destroyInventoryItems(
        { items: [weapon, fourStarWeapon], nextId: 2 },
        EMPTY_WALLET,
        [weapon.id, fourStarWeapon.id],
        englishNameText,
        materialDataMap,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: getDestroyableItem, 1]`,
    );
  });

  test("refuses the destruction, leaving nothing destroyed, when a full ore stack cannot take the returned ore", () => {
    expect.hasAssertions();

    const weapon = createWeapon(0, 3, DestroyRule.ReturnMaterial);
    const fullOreStack: InventoryItem = {
      definition: getItemDefinition(ORE_ID, englishNameText, materialDataMap),
      id: 1,
      quantity: ORE_STACK_LIMIT,
    };
    const inventory = { items: [weapon, fullOreStack], nextId: 2 };

    expect(
      destroyInventoryItems(inventory, EMPTY_WALLET, [weapon.id], englishNameText, materialDataMap),
    ).toBeUndefined();
    expect(inventory.items).toStrictEqual([weapon, fullOreStack]);
  });
});
