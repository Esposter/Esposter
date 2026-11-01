import { FishingStockType } from "#src/models/fishing/FishingStockType";
import { computeFishingCatchAts } from "#src/services/fishing/computeFishingCatchAts";
import { FISH_RESPAWN_DURATION } from "#src/services/fishing/constants";
import { getFishingStockKey } from "#src/services/fishing/getFishingStockKey";
import { describe, expect, test } from "vitest";

describe(computeFishingCatchAts, () => {
  const CAUGHT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const RETURNED_AT = CAUGHT_AT.add(FISH_RESPAWN_DURATION);
  const POOL_ID = 1;
  const DAY_KEY = getFishingStockKey(POOL_ID, FishingStockType.Day);
  const NIGHT_KEY = getFishingStockKey(POOL_ID, FishingStockType.Night);

  test("a catch not yet back stays beside the new one under its own stock", () => {
    expect.hasAssertions();

    const nextCaughtAtMap = computeFishingCatchAts(
      new Map([[DAY_KEY, [CAUGHT_AT]]]),
      DAY_KEY,
      CAUGHT_AT.add({ hours: 1 }),
    );

    expect(nextCaughtAtMap.get(DAY_KEY)?.map(String)).toStrictEqual([
      CAUGHT_AT.toString(),
      CAUGHT_AT.add({ hours: 1 }).toString(),
    ]);
  });

  test("a catch returned leaves the record, and a stock with none left not yet back is dropped", () => {
    expect.hasAssertions();

    const nextCaughtAtMap = computeFishingCatchAts(new Map([[NIGHT_KEY, [CAUGHT_AT]]]), DAY_KEY, RETURNED_AT);

    expect([...nextCaughtAtMap.keys()]).toStrictEqual([DAY_KEY]);
    expect(nextCaughtAtMap.get(DAY_KEY)?.map(String)).toStrictEqual([RETURNED_AT.toString()]);
  });
});
