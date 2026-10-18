import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { LONG_TERM_MAJOR_VERSION, LONG_TERM_RESIN_COST } from "#src/services/commission/constants";
import { convertLongTermEncounterPoint } from "#src/services/commission/convertLongTermEncounterPoint";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

const longTermOf = (halfPoints: number, majorVersion = LONG_TERM_MAJOR_VERSION): LongTermEncounterPoints => ({
  halfPoints,
  majorVersion,
});

describe(convertLongTermEncounterPoint, () => {
  const NOW = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 48 });
  const STORAGE = 8;
  const pointsOf = (halfPoints: number): EncounterPoints => ({ earnedOn: NOW, halfPoints });
  // The resin last changed at `now`, so none regenerates between the reading and the spend
  const walletOf = (resin: number): Wallet => ({
    ...EMPTY_WALLET,
    [Currency.OriginalResin]: resin,
    originalResinChangedAt: NOW,
  });
  const convertOf = (
    encounterPoints: EncounterPoints,
    longTermEncounterPoints: LongTermEncounterPoints,
    resin = LONG_TERM_RESIN_COST,
  ) =>
    convertLongTermEncounterPoint({
      encounterPoints,
      longTermEncounterPoints,
      majorVersion: LONG_TERM_MAJOR_VERSION,
      now: NOW,
      storage: STORAGE,
      wallet: walletOf(resin),
    });

  test("should convert a long-term point for thirty Original Resin, where the daily points are a whole point short", () => {
    expect.hasAssertions();

    expect(convertOf(pointsOf(0), longTermOf(2))).toStrictEqual({
      encounterPoints: pointsOf(2),
      longTermEncounterPoints: longTermOf(0),
      wallet: walletOf(0),
    });
  });

  test("should refuse a conversion where the long-term points hold less than a whole point", () => {
    expect.hasAssertions();

    expect(convertOf(pointsOf(0), longTermOf(1))).toBeUndefined();
  });

  test("should refuse a conversion where the daily points leave no room for a whole point", () => {
    expect.hasAssertions();

    expect(convertOf(pointsOf(STORAGE - 1), longTermOf(2))).toBeUndefined();
  });

  test("should refuse a conversion the Original Resin cannot pay, and convert nothing", () => {
    expect.hasAssertions();

    expect(convertOf(pointsOf(0), longTermOf(2), LONG_TERM_RESIN_COST - 1)).toBeUndefined();
  });

  test("should refuse a conversion of points held from an earlier major version", () => {
    expect.hasAssertions();

    expect(convertOf(pointsOf(0), longTermOf(4, LONG_TERM_MAJOR_VERSION - 1))).toBeUndefined();
  });
});
