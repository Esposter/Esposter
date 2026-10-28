import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { readGameData } from "#src/services/data/readGameData";
import { REALM_DEPOT_GOODS_KEYS, REALM_DEPOT_SHOP_ID } from "#src/services/shop/constants";
import { readShopGoodMap } from "#src/services/shop/readShopGoodMap";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/data/readGameData"));

describe(readShopGoodMap, () => {
  const GAME_DATA_BASE_URL = "https://example.test/game-data";
  // A table date computed from the epoch, as the shops dataset writes its game-time moments
  const EPOCH_TIME = Temporal.Instant.fromEpochMilliseconds(0).toString();
  // A made-up good, its id the one the test reads back in the depot's order
  const createGood = (goodsId: number): ShopGood => ({
    beginTime: EPOCH_TIME,
    buyLimit: 0,
    costs: [{ count: 1, itemId: 1 }],
    endTime: EPOCH_TIME,
    goodsId,
    itemCount: 1,
    itemId: 1,
    minPlayerLevel: 1,
    refresh: ShopRefresh.None,
  });

  test("the Realm Depot's goods, split across its tabs' keys, are one list in the tabs' order", async () => {
    expect.hasAssertions();

    const keyGoodsMap = new Map<GameDataKey, ShopGood[]>(
      REALM_DEPOT_GOODS_KEYS.map((key, index) => [key, [createGood(index + 1)]]),
    );
    vi.mocked(readGameData).mockImplementation((_gameDataBaseUrl, key) => Promise.resolve(keyGoodsMap.get(key) ?? []));

    const goodMap = await readShopGoodMap(GAME_DATA_BASE_URL);

    expect(goodMap.get(REALM_DEPOT_SHOP_ID)).toStrictEqual(
      REALM_DEPOT_GOODS_KEYS.map((_key, index) => createGood(index + 1)),
    );
  });
});
