import type { Artifact } from "#src/models/artifact/Artifact";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { Currency } from "#src/models/inventory/Currency";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import {
  CurrencyItemIdMap,
  EMPTY_INVENTORY,
  EMPTY_WALLET,
  MORA_ITEM_ID,
  WEAPON_START_ASCENSION,
  WEAPON_START_EXPERIENCE,
  WEAPON_START_LEVEL,
  WEAPON_START_REFINEMENT,
} from "#src/services/inventory/constants";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

describe(pickUpDroppedItem, () => {
  const maskId = 112_005;

  test("takes Mora into the wallet", () => {
    expect.hasAssertions();

    expect(
      pickUpDroppedItem(
        { count: 5, itemId: MORA_ITEM_ID },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        englishNameText,
        materialDataMap,
      ),
    ).toStrictEqual({ inventory: EMPTY_INVENTORY, overflow: 0, wallet: { ...EMPTY_WALLET, [Currency.Mora]: 5 } });
  });

  test("takes any other currency into the wallet by its currency", () => {
    expect.hasAssertions();

    expect(
      pickUpDroppedItem(
        { count: 1, itemId: CurrencyItemIdMap[Currency.AcquaintFate] },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        englishNameText,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      overflow: 0,
      wallet: { ...EMPTY_WALLET, [Currency.AcquaintFate]: 1 },
    });
  });

  test("takes a material into the bag as its definition", () => {
    expect.hasAssertions();

    const definition = getItemDefinition(maskId, englishNameText, materialDataMap);

    expect(
      pickUpDroppedItem({ count: 1, itemId: maskId }, EMPTY_INVENTORY, EMPTY_WALLET, englishNameText, materialDataMap),
    ).toStrictEqual({
      inventory: { items: [{ definition, id: 0, quantity: 1 }], nextId: 1 },
      overflow: 0,
      wallet: EMPTY_WALLET,
    });
  });

  test("leaves what a full stack has no room for", () => {
    expect.hasAssertions();

    const definition = getItemDefinition(maskId, englishNameText, materialDataMap);
    const { inventory } = addInventoryItem(EMPTY_INVENTORY, definition, definition.stackLimit);

    expect(
      pickUpDroppedItem({ count: 2, itemId: maskId }, inventory, EMPTY_WALLET, englishNameText, materialDataMap),
    ).toStrictEqual({ inventory, overflow: 2, wallet: EMPTY_WALLET });
  });

  test("takes a dropped artifact into the bag as the artifact it rolled", () => {
    expect.hasAssertions();

    const pieceId = 90_101;
    const names = { TEST_PIECE: "Test Piece" };
    const piece: ReliquaryPieceEntry = {
      itemId: pieceId,
      nameTextId: "TEST_PIECE",
      rank: 1,
      rarity: 1,
      setId: 90_001,
      slot: ArtifactSlot.FlowerOfLife,
      startingMinorCount: 1,
    };
    const reliquaryPieceEntryMap = new Map([[pieceId, piece]]);
    const artifact: Artifact = {
      experience: 0,
      isLocked: false,
      level: 0,
      mainAffix: Attribute.Health,
      minorAffixes: [{ attribute: Attribute.Attack, value: 10 }],
      rarity: 1,
      setId: 90_001,
      slot: ArtifactSlot.FlowerOfLife,
    };

    expect(
      pickUpDroppedItem(
        { artifact, count: 1, itemId: pieceId },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        names,
        materialDataMap,
        reliquaryPieceEntryMap,
      ),
    ).toStrictEqual({
      inventory: {
        items: [
          {
            artifact,
            definition: getDroppedItemDefinition(pieceId, names, new Map(), materialDataMap, reliquaryPieceEntryMap),
            id: 0,
            quantity: 1,
          },
        ],
        nextId: 1,
      },
      overflow: 0,
      wallet: EMPTY_WALLET,
    });
  });

  test("takes a dropped weapon into the bag as a weapon of its own", () => {
    expect.hasAssertions();

    const weaponId = 90_201;
    const names = { TEST_WEAPON: "Test Weapon" };
    const weaponData: WeaponData = {
      ascensionPhases: [],
      baseExp: 0,
      destroyReturnMaterial: 0,
      destroyReturnMaterialCount: 0,
      destroyRule: DestroyRule.None,
      growAttributes: [],
      id: weaponId,
      nameTextId: "TEST_WEAPON",
      passiveNameTextId: "",
      passiveRankAttributeLines: [],
      passiveRankDescriptionTextIds: [],
      passiveRankParams: [],
      rarity: 3,
      refinementCosts: [],
      refinementMaterialId: 0,
      weaponType: WeaponType.Sword,
    };

    expect(
      pickUpDroppedItem(
        { count: 1, itemId: weaponId },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        names,
        materialDataMap,
        new Map(),
        new Map([[weaponId, weaponData]]),
      ),
    ).toStrictEqual({
      inventory: {
        items: [
          {
            ascension: WEAPON_START_ASCENSION,
            definition: {
              category: ItemCategory.Weapon,
              destroyReturnMaterial: 0,
              destroyReturnMaterialCount: 0,
              destroyRule: DestroyRule.None,
              id: weaponId,
              name: "Test Weapon",
              rank: 0,
              rarity: 3,
              stackLimit: 1,
            },
            experience: WEAPON_START_EXPERIENCE,
            id: 0,
            level: WEAPON_START_LEVEL,
            quantity: 1,
            refinement: WEAPON_START_REFINEMENT,
          },
        ],
        nextId: 1,
      },
      overflow: 0,
      wallet: EMPTY_WALLET,
    });
  });
});
