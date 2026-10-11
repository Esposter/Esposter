import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { buildItems } from "#src/services/genshinAssets/items/buildItems";
import { EnemyDropFamilyDropTableMap, GameDataset } from "genshin-world";
import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gameData/readPublishedGameData"), () => ({
  readPublishedGameData: vi.fn<(key: string) => Promise<unknown>>(),
}));
vi.mock(import("#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces"), () => ({
  readMondstadtExpeditionPlaces: vi.fn<() => never[]>(() => []),
}));
vi.mock(import("node:fs/promises"), () => ({ readFile: vi.fn<(path: string, encoding: string) => Promise<string>>() }));

const TREE_ITEM_ID = 107010;
const TREE_REWARD_ITEM_ID = 2000;
const ADVENTURE_EXP_ID = 102;

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
] satisfies MaterialRow[];

describe(buildItems, () => {
  beforeEach(() => {
    const dropItemRows = Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) =>
      materials.map(({ itemId }) => ({ ...materialRows[0], id: itemId, nameTextMapHash: itemId })),
    );
    vi.mocked(readFile).mockResolvedValue(JSON.stringify([...materialRows, ...dropItemRows]));
    vi.mocked(readPublishedGameData).mockImplementation((key) =>
      Promise.resolve(
        key === "offerings/frostbearingTree"
          ? [
              { itemCount: 0, itemId: TREE_ITEM_ID, level: 1, rewards: [{ itemCount: 1, itemId: ADVENTURE_EXP_ID }] },
              {
                itemCount: 10,
                itemId: TREE_ITEM_ID,
                level: 2,
                rewards: [{ itemCount: 5, itemId: TREE_REWARD_ITEM_ID }],
              },
            ]
          : [],
      ),
    );
  });

  test("publishes every item the Frostbearing Tree takes or pays, less the wallet's", async () => {
    expect.hasAssertions();

    const built = await buildItems();

    const ids = built[`${GameDataset.Items}/materials`] as { id: number }[];

    expect(ids.map(({ id }) => id)).toStrictEqual(expect.arrayContaining([TREE_ITEM_ID, TREE_REWARD_ITEM_ID]));
    expect(ids.map(({ id }) => id)).not.toContain(ADVENTURE_EXP_ID);
  });
});
