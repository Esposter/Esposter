import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readResinParam } from "#src/services/originalResin/readResinParam";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { describe, expect, test } from "vitest";

const resinParam = await readResinParam(GAME_DATA_LOCAL_BASE_URL);

describe(regenerateOriginalResin, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };

  test("a point regenerates each interval, and the moment moves on by the points that came", () => {
    expect.hasAssertions();

    expect(
      regenerateOriginalResin(wallet, epoch.add({ minutes: resinParam.originalResinRegenMinutes * 2 + 1 }), resinParam),
    ).toStrictEqual({
      ...wallet,
      [Currency.OriginalResin]: 102,
      originalResinChangedAt: epoch.add({ minutes: resinParam.originalResinRegenMinutes * 2 }),
    });
  });

  test("no point before an interval has passed, and the moment keeps its place", () => {
    expect.hasAssertions();

    expect(
      regenerateOriginalResin(wallet, epoch.add({ minutes: resinParam.originalResinRegenMinutes - 1 }), resinParam),
    ).toStrictEqual(wallet);
  });

  test("regeneration stops at the cap, with the moment at now", () => {
    expect.hasAssertions();

    const now = epoch.add({ hours: 24 });

    expect(
      regenerateOriginalResin(
        { ...wallet, [Currency.OriginalResin]: resinParam.originalResinCap - 1 },
        now,
        resinParam,
      ),
    ).toStrictEqual({ ...wallet, [Currency.OriginalResin]: resinParam.originalResinCap, originalResinChangedAt: now });
  });

  test("resin past the cap does not regenerate", () => {
    expect.hasAssertions();

    const now = epoch.add({ hours: 24 });
    const refilled = { ...wallet, [Currency.OriginalResin]: resinParam.originalResinCap + 1 };

    expect(regenerateOriginalResin(refilled, now, resinParam)).toStrictEqual({
      ...refilled,
      originalResinChangedAt: now,
    });
  });
});
