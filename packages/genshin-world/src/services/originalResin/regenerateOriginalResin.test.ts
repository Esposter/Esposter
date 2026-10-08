import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ORIGINAL_RESIN_CAP, ORIGINAL_RESIN_REGEN_MINUTES } from "#src/services/originalResin/constants";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { describe, expect, test } from "vitest";

describe(regenerateOriginalResin, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };

  test("a point regenerates each interval, and the moment moves on by the points that came", () => {
    expect.hasAssertions();

    expect(regenerateOriginalResin(wallet, epoch.add({ minutes: ORIGINAL_RESIN_REGEN_MINUTES * 2 + 1 }))).toStrictEqual(
      {
        ...wallet,
        [Currency.OriginalResin]: 102,
        originalResinChangedAt: epoch.add({ minutes: ORIGINAL_RESIN_REGEN_MINUTES * 2 }),
      },
    );
  });

  test("no point before an interval has passed, and the moment keeps its place", () => {
    expect.hasAssertions();

    expect(regenerateOriginalResin(wallet, epoch.add({ minutes: ORIGINAL_RESIN_REGEN_MINUTES - 1 }))).toStrictEqual(
      wallet,
    );
  });

  test("regeneration stops at the cap, with the moment at now", () => {
    expect.hasAssertions();

    const now = epoch.add({ hours: 24 });

    expect(regenerateOriginalResin({ ...wallet, [Currency.OriginalResin]: ORIGINAL_RESIN_CAP - 1 }, now)).toStrictEqual(
      { ...wallet, [Currency.OriginalResin]: ORIGINAL_RESIN_CAP, originalResinChangedAt: now },
    );
  });

  test("resin past the cap does not regenerate", () => {
    expect.hasAssertions();

    const now = epoch.add({ hours: 24 });
    const refilled = { ...wallet, [Currency.OriginalResin]: ORIGINAL_RESIN_CAP + 1 };

    expect(regenerateOriginalResin(refilled, now)).toStrictEqual({ ...refilled, originalResinChangedAt: now });
  });
});
