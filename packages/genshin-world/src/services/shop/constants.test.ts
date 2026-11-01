import type { ShopGood } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { describe } from "vitest";

const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);

// A limited good that refreshes each game day, and the moment the daily-refresh suites read it at
export const DAILY_LIMITED_GOOD: ShopGood = {
  beginTime: EPOCH.toString(),
  buyLimit: 3,
  costs: [{ count: 2, itemId: 202 }],
  endTime: EPOCH.add({ hours: 876_000 }).toString(),
  goodsId: 7,
  itemCount: 1,
  itemId: 1,
  minPlayerLevel: 1,
  refresh: ShopRefresh.Daily,
};
export const DAILY_NOW = EPOCH.add({ hours: 300 });

describe.todo("constants");
