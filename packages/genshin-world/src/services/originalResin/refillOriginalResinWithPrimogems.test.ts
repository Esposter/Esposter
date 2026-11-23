import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readResinParam } from "#src/services/originalResin/readResinParam";
import { refillOriginalResinWithPrimogems } from "#src/services/originalResin/refillOriginalResinWithPrimogems";
import { describe, expect, test } from "vitest";

const resinParam = await readResinParam(GAME_DATA_LOCAL_BASE_URL);

describe(refillOriginalResinWithPrimogems, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const gameDay = epoch.toZonedDateTimeISO("UTC").toPlainDate();
  // The schedule's first two prices, 50 and 100 Primogems
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100, [Currency.Primogem]: 50 };
  const usedUp = {
    ...wallet,
    primogemResinRefillCount: resinParam.primogemResinRefillPrices.length,
    primogemResinRefillDay: gameDay,
  };

  test("a refill restores the resin for its price in Primogems, and counts toward the day", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(wallet, epoch, resinParam)).toStrictEqual({
      ...wallet,
      [Currency.OriginalResin]: 100 + resinParam.primogemResinRestore,
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

    expect(refillOriginalResinWithPrimogems(secondRefill, epoch, resinParam)).toStrictEqual({
      ...secondRefill,
      [Currency.OriginalResin]: 100 + resinParam.primogemResinRestore,
      [Currency.Primogem]: 0,
      primogemResinRefillCount: 2,
    });
  });

  test("a day's refills are used up after its last price", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(usedUp, epoch, resinParam)).toBeUndefined();
  });

  test("the game's day runs on to its start hour, so 3 AM is still the day before and the count restarts at the next", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems(usedUp, epoch.add({ hours: 19 }), resinParam)).toBeUndefined();
    expect(refillOriginalResinWithPrimogems(usedUp, epoch.add({ hours: 24 }), resinParam)).toStrictEqual({
      ...usedUp,
      [Currency.OriginalResin]: resinParam.originalResinCap + resinParam.primogemResinRestore,
      [Currency.Primogem]: 0,
      originalResinChangedAt: epoch.add({ hours: 24 }),
      primogemResinRefillCount: 1,
      primogemResinRefillDay: epoch.add({ hours: 24 }).toZonedDateTimeISO("UTC").toPlainDate(),
    });
  });

  test("a refill short of its price, or that would pass the refill cap, is refused", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithPrimogems({ ...wallet, [Currency.Primogem]: 0 }, epoch, resinParam)).toBeUndefined();
    expect(
      refillOriginalResinWithPrimogems(
        {
          ...wallet,
          [Currency.OriginalResin]: resinParam.originalResinRefillCap - resinParam.primogemResinRestore + 1,
        },
        epoch,
        resinParam,
      ),
    ).toBeUndefined();
  });

  test("a refill that reaches the refill cap exactly is made", () => {
    expect.hasAssertions();

    expect(
      refillOriginalResinWithPrimogems(
        { ...wallet, [Currency.OriginalResin]: resinParam.originalResinRefillCap - resinParam.primogemResinRestore },
        epoch,
        resinParam,
      )?.[Currency.OriginalResin],
    ).toBe(resinParam.originalResinRefillCap);
  });
});
