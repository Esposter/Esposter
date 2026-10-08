import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import {
  ORIGINAL_RESIN_CAP,
  ORIGINAL_RESIN_REFILL_CAP,
  PRIMOGEM_RESIN_REFILL_PRICES,
  PRIMOGEM_RESIN_RESTORE,
} from "#src/services/originalResin/constants";
import { refillOriginalResinWithPrimogems } from "#src/services/originalResin/refillOriginalResinWithPrimogems";
import { describe, expect, test } from "vitest";

describe(refillOriginalResinWithPrimogems, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const gameDay = epoch.toZonedDateTimeISO("UTC").toPlainDate();
  // The schedule's first two prices, 50 and 100 Primogems
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100, [Currency.Primogem]: 50 };
  const usedUp = {
    ...wallet,
    primogemResinRefillCount: PRIMOGEM_RESIN_REFILL_PRICES.length,
    primogemResinRefillDay: gameDay,
  };

  test("a refill restores the resin for its price in Primogems, and counts toward the day", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(wallet, epoch)).toStrictEqual({
      ...wallet,
      [Currency.OriginalResin]: 100 + PRIMOGEM_RESIN_RESTORE,
      [Currency.Primogem]: 0,
      primogemResinRefillCount: 1,
      primogemResinRefillDay: gameDay,
    });
  });

  test("the next refill of the day costs the next price", () => {
    expect.hasAssertions();

    const secondRefill = {
      ...wallet,
      [Currency.Primogem]: 100,
      primogemResinRefillCount: 1,
      primogemResinRefillDay: gameDay,
    };

    expect(refillOriginalResinWithPrimogems(secondRefill, epoch)).toStrictEqual({
      ...secondRefill,
      [Currency.OriginalResin]: 100 + PRIMOGEM_RESIN_RESTORE,
      [Currency.Primogem]: 0,
      primogemResinRefillCount: 2,
    });
  });

  test("a day's refills are used up after its last price", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(usedUp, epoch)).toBeUndefined();
  });

  test("the game's day runs on to its start hour, so 3 AM is still the day before and the count restarts at the next", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(usedUp, epoch.add({ hours: 19 }))).toBeUndefined();
    expect(refillOriginalResinWithPrimogems(usedUp, epoch.add({ hours: 24 }))).toStrictEqual({
      ...usedUp,
      [Currency.OriginalResin]: ORIGINAL_RESIN_CAP + PRIMOGEM_RESIN_RESTORE,
      [Currency.Primogem]: 0,
      originalResinChangedAt: epoch.add({ hours: 24 }),
      primogemResinRefillCount: 1,
      primogemResinRefillDay: epoch.add({ hours: 24 }).toZonedDateTimeISO("UTC").toPlainDate(),
    });
  });

  test("a refill short of its price, or at the refill cap, is refused", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems({ ...wallet, [Currency.Primogem]: 0 }, epoch)).toBeUndefined();
    expect(
      refillOriginalResinWithPrimogems({ ...wallet, [Currency.OriginalResin]: ORIGINAL_RESIN_REFILL_CAP }, epoch),
    ).toBeUndefined();
  });
});
