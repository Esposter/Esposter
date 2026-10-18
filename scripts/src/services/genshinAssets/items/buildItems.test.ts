import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { CookingRecipe } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readCookingRecipes } from "#src/services/genshinAssets/cooking/readCookingRecipes";
import { buildItems } from "#src/services/genshinAssets/items/buildItems";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { CookingFoodType, CookingQuality, EnemyDropFamilyDropTableMap, GadgetKind, GameDataset } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gameData/readPublishedGameData"), () => ({
  readPublishedGameData: vi.fn<(...args: unknown[]) => Promise<never>>(),
}));
vi.mock(import("#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces"), () => ({
  readMondstadtExpeditionPlaces: vi.fn<() => never[]>(() => []),
}));
vi.mock(import("#src/services/genshinAssets/cooking/readCookingRecipes"), () => ({
  readCookingRecipes: vi.fn<() => CookingRecipe[]>(() => []),
}));
vi.mock(import("#src/services/genshinText/readExcelTable"), () => ({ readExcelTable: vi.fn<() => never[]>() }));

describe(buildItems, () => {
  const TREE_ITEM_ID = 107010;

  const TREE_REWARD_ITEM_ID = 2000;

  const REPUTATION_REWARD_ITEM_ID = 140004;

  const GADGET_ITEM_ID = 1001;
  const GROCERY_ITEM_ID = 3000;

  const ADVENTURE_EXP_ID = 102;

  const DISH_ITEM_ID = 108_011;
  const INSTRUCTION_ITEM_ID = 109_101;

  const BATCH_CONSUMABLE_ITEM_ID = 7001;
  const QUEST_CONSUMABLE_ITEM_ID = 7002;

  const materialRows = [
    {
      foodQuality: "",
      id: ADVENTURE_EXP_ID,
      itemUse: [],
      materialType: "MATERIAL_EXP_FRUIT",
      nameTextMapHash: 1,
      rank: 1,
      rankLevel: 1,
      stackLimit: 99,
    },
    {
      foodQuality: "",
      id: TREE_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_ELEC_CRYSTAL",
      nameTextMapHash: 2,
      rank: 1,
      rankLevel: 2,
      stackLimit: 99,
    },
    {
      foodQuality: "",
      id: TREE_REWARD_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_ADSORBATE",
      nameTextMapHash: 3,
      rank: 1,
      rankLevel: 3,
      stackLimit: 99,
    },
    {
      foodQuality: "FOOD_QUALITY_STRANGE",
      id: DISH_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_FOOD",
      nameTextMapHash: 5,
      rank: 1,
      rankLevel: 1,
      stackLimit: 99,
    },
    {
      id: INSTRUCTION_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_CONSUME",
      nameTextMapHash: 6,
      rank: 1,
      rankLevel: 1,
      stackLimit: 99,
    },
    {
      foodQuality: "",
      id: REPUTATION_REWARD_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_FLYCLOAK",
      nameTextMapHash: 4,
      rank: 1,
      rankLevel: 4,
      stackLimit: 1,
    },
    {
      foodQuality: "",
      id: GADGET_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_WIDGET",
      nameTextMapHash: 5,
      rank: 1,
      rankLevel: 1,
      stackLimit: 1,
    },
    {
      foodQuality: "",
      id: GROCERY_ITEM_ID,
      itemUse: [],
      materialType: "MATERIAL_ADSORBATE",
      nameTextMapHash: 5,
      rank: 1,
      rankLevel: 1,
      stackLimit: 99,
    },
  ] satisfies MaterialRow[];

  beforeEach(() => {
    const dropItemRows = Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) =>
      materials.map(({ itemId }) => ({ ...materialRows[0], id: itemId, nameTextMapHash: itemId })),
    );
    vi.mocked(readExcelTable).mockReturnValue([...materialRows, ...dropItemRows]);
    vi.mocked(readPublishedGameData).mockImplementation((key) => {
      if (key === "offerings/frostbearingTree")
        return Promise.resolve([
          {
            items: [{ itemCount: 0, itemId: TREE_ITEM_ID }],
            level: 1,
            reward: { kind: "fixed", rewards: [{ itemCount: 1, itemId: ADVENTURE_EXP_ID }] },
          },
          {
            items: [{ itemCount: 10, itemId: TREE_ITEM_ID }],
            level: 2,
            reward: { kind: "fixed", rewards: [{ itemCount: 5, itemId: TREE_REWARD_ITEM_ID }] },
          },
        ]);
      if (key === "gadgets/gadgets")
        return Promise.resolve([
          {
            cooldownGroup: 0,
            cooldownOnFailSeconds: 0,
            cooldownSeconds: 0,
            gatherItemId: 0,
            id: GADGET_ITEM_ID,
            isEquipable: true,
            kind: GadgetKind.Detector,
            maxCountByPlayer: 0,
            maxCountInScene: 0,
            maxPoints: 0,
            region: "",
          },
        ]);
      if (key === "shops/mondstadtGeneralGoods") return Promise.resolve([{ itemId: GROCERY_ITEM_ID }]);
      if (key === "reputation/mondstadt")
        return Promise.resolve({
          bounties: [],
          bountyTargets: [],
          explores: [],
          huntingRegions: [],
          levels: [
            {
              functionIds: [],
              goodsIds: [],
              level: 8,
              nextLevelExp: 0,
              requestGroupId: 1,
              reward: { exp: 0, items: [{ count: 1, id: REPUTATION_REWARD_ITEM_ID }] },
            },
          ],
          quests: [],
          requests: [],
        });
      return Promise.resolve([]);
    });
  });

  test("publishes every item the Frostbearing Tree takes or pays, less the wallet's", async () => {
    expect.hasAssertions();

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toStrictEqual(expect.arrayContaining([TREE_ITEM_ID, TREE_REWARD_ITEM_ID]));
    expect(ids.map(({ id }) => id)).not.toContain(ADVENTURE_EXP_ID);
  });

  test("a gadget appears in the gadget tab", async () => {
    expect.hasAssertions();

    const built = await buildItems();

    const items = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(items.filter(({ id }) => id === GADGET_ITEM_ID)).toStrictEqual([
      { id: GADGET_ITEM_ID, materialType: "MATERIAL_WIDGET", nameTextId: "5", rank: 1, rarity: 1, stackLimit: 1 },
    ]);
  });

  test("publishes every dish a cook recipe yields", async () => {
    expect.hasAssertions();
    vi.mocked(readCookingRecipes).mockReturnValueOnce([
      {
        foodType: CookingFoodType.Heal,
        id: 1,
        ingredients: [],
        isDefaultUnlocked: true,
        maxProficiency: 1,
        nameTextId: "1",
        qteParam: [0, 0],
        rankLevel: 1,
        resultItemIds: {
          [CookingQuality.Delicious]: DISH_ITEM_ID,
          [CookingQuality.Regular]: DISH_ITEM_ID,
          [CookingQuality.Suspicious]: DISH_ITEM_ID,
        },
        specialties: [],
        unlockItemIds: [],
      },
    ]);

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toContain(DISH_ITEM_ID);
  });

  test("every instruction item a cook recipe unlocks is an item", async () => {
    expect.hasAssertions();
    vi.mocked(readCookingRecipes).mockReturnValueOnce([
      {
        foodType: CookingFoodType.Heal,
        id: 1,
        ingredients: [],
        isDefaultUnlocked: false,
        maxProficiency: 1,
        nameTextId: "1",
        qteParam: [0, 0],
        rankLevel: 1,
        resultItemIds: {
          [CookingQuality.Delicious]: DISH_ITEM_ID,
          [CookingQuality.Regular]: DISH_ITEM_ID,
          [CookingQuality.Suspicious]: DISH_ITEM_ID,
        },
        specialties: [],
        unlockItemIds: [INSTRUCTION_ITEM_ID],
      },
    ]);
    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toContain(INSTRUCTION_ITEM_ID);
  });

  test("publishes every item a Reputation level pays", async () => {
    expect.hasAssertions();

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toContain(REPUTATION_REWARD_ITEM_ID);
  });

  test("publishes every item the Mondstadt grocery sells", async () => {
    expect.hasAssertions();

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toContain(GROCERY_ITEM_ID);
  });

  test("a named item the material table gives no type fails the publish", async () => {
    expect.hasAssertions();
    const materialTable = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
    vi.mocked(readExcelTable).mockReturnValue([
      ...materialTable.filter(({ id }) => id !== TREE_ITEM_ID),
      { ...materialRows[1], materialType: undefined },
    ]);

    await expect(buildItems()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 107010, has no material type in the material table, so the bag would show it in no tab]`,
    );
  });

  test("publishes a consumable whose use adds an item, filed under the consume tab", async () => {
    expect.hasAssertions();
    vi.mocked(readExcelTable).mockReturnValue([
      ...readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
      {
        foodQuality: "",
        id: BATCH_CONSUMABLE_ITEM_ID,
        itemUse: [{ useOp: "ITEM_USE_ADD_ITEM", useParam: [String(GADGET_ITEM_ID), "1"] }],
        materialType: "MATERIAL_CONSUME_BATCH_USE",
        nameTextMapHash: 7,
        rank: 1,
        rankLevel: 2,
        stackLimit: 99,
      },
    ]);

    const built = await buildItems();

    const items = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(items.filter(({ id }) => id === BATCH_CONSUMABLE_ITEM_ID)).toStrictEqual([
      {
        id: BATCH_CONSUMABLE_ITEM_ID,
        materialType: "MATERIAL_CONSUME",
        nameTextId: "7",
        rank: 1,
        rarity: 2,
        stackLimit: 99,
      },
    ]);
  });

  test("a consumable of a tab the bag does not show is no bag item", async () => {
    expect.hasAssertions();
    vi.mocked(readExcelTable).mockReturnValue([
      ...readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
      {
        foodQuality: "",
        id: QUEST_CONSUMABLE_ITEM_ID,
        itemUse: [{ useOp: "ITEM_USE_ADD_ITEM", useParam: [String(GADGET_ITEM_ID), "1"] }],
        materialType: "MATERIAL_QUEST",
        nameTextMapHash: 8,
        rank: 1,
        rankLevel: 1,
        stackLimit: 99,
      },
    ]);

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).not.toContain(QUEST_CONSUMABLE_ITEM_ID);
  });
});
