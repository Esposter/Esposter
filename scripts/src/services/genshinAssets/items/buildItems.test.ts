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
          { itemCount: 0, itemId: TREE_ITEM_ID, level: 1, rewards: [{ itemCount: 1, itemId: ADVENTURE_EXP_ID }] },
          { itemCount: 10, itemId: TREE_ITEM_ID, level: 2, rewards: [{ itemCount: 5, itemId: TREE_REWARD_ITEM_ID }] },
        ]);
      if (key === "gadgets/gadgets")
        return Promise.resolve([
          {
            cooldownGroup: 0,
            cooldownOnFailSeconds: 0,
            cooldownSeconds: 0,
            id: GADGET_ITEM_ID,
            isEquipable: true,
            kind: GadgetKind.Detector,
          },
        ]);
      if (key === "shops/mondstadtGeneralGoods") return Promise.resolve([{ itemId: GROCERY_ITEM_ID }]);
      if (key === "reputation/mondstadt")
        return Promise.resolve({
          bounties: [],
          explores: [],
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

  test("leaves out an item the material table gives no type, as the dump leaves out MATERIAL_NONE", async () => {
    expect.hasAssertions();
    const materialTable = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
    vi.mocked(readExcelTable).mockReturnValue([
      ...materialTable.filter(({ id }) => id !== TREE_ITEM_ID),
      { ...materialRows[1], materialType: undefined },
    ]);

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).not.toContain(TREE_ITEM_ID);
    expect(ids.map(({ id }) => id)).toContain(TREE_REWARD_ITEM_ID);
  });
});
