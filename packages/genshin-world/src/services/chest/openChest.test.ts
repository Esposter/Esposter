import { ChestKind } from "#src/models/chest/ChestKind";
import { Currency } from "#src/models/inventory/Currency";
import { openChest } from "#src/services/chest/openChest";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(openChest, () => {
  const CHEST_ID = "chest-1";
  const commonChest = { id: CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } };
  const NO_OPENED_CHESTS: ReadonlySet<string> = new Set();

  test("rolls each reward within its range and keeps the chest as opened", () => {
    expect.hasAssertions();

    const lowest = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0);
    expect(lowest.openedChestIds).toStrictEqual(new Set([CHEST_ID]));
    expect(lowest.wallet).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: 257, [Currency.Primogem]: 0 });

    const highest = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0.999);
    expect(highest.wallet).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: 996, [Currency.Primogem]: 2 });
  });

  test("opens a chest only once", () => {
    expect.hasAssertions();

    const opened = new Set([CHEST_ID]);
    expect(openChest(commonChest, opened, EMPTY_WALLET, () => 0)).toStrictEqual({
      openedChestIds: opened,
      wallet: EMPTY_WALLET,
    });
  });

  test("leaves a chest of a kind with no reward yet unopened", () => {
    expect.hasAssertions();

    const luxuriousChest = { ...commonChest, kind: ChestKind.Luxurious };
    expect(openChest(luxuriousChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0)).toStrictEqual({
      openedChestIds: NO_OPENED_CHESTS,
      wallet: EMPTY_WALLET,
    });
  });
});
