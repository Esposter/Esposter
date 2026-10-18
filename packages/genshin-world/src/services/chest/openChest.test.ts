import { ChestKind } from "#src/models/chest/ChestKind";
import { Currency } from "#src/models/inventory/Currency";
import { openChest } from "#src/services/chest/openChest";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(openChest, () => {
  const CHEST_ID = "chest-1";
  const commonChest = { id: CHEST_ID, kind: ChestKind.Common, position: { x: 0, z: 0 } };
  const NO_OPENED_CHESTS: ReadonlySet<string> = new Set();
  const COMMON_DROPS = [
    { count: 1, itemId: 11_101 },
    { count: 4, itemId: 104_001 },
    { count: 1, itemId: 104_002 },
  ];

  test("rolls each reward within its range and keeps the chest as opened", () => {
    expect.hasAssertions();

    const lowest = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, false);
    expect(lowest.drops).toStrictEqual(COMMON_DROPS);
    expect(lowest.openedChestIds).toStrictEqual(new Set([CHEST_ID]));
    expect(lowest.wallet).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: 257, [Currency.Primogem]: 0 });

    const highest = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0.999, false);
    expect(highest.wallet).toStrictEqual({ ...EMPTY_WALLET, [Currency.Mora]: 996, [Currency.Primogem]: 2 });
  });

  test("opening a chest adds its Adventure EXP", () => {
    expect.hasAssertions();

    expect(openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, false).adventureExp).toBe(30);
  });

  test("an opened chest pours its drops out on open ground", () => {
    expect.hasAssertions();

    const opening = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, false);
    expect(opening.drops).toStrictEqual(COMMON_DROPS);
    expect(opening.bagDrops).toStrictEqual([]);
  });

  test("an opened chest sends its drops to the bag where a drop would fall away", () => {
    expect.hasAssertions();

    const opening = openChest(commonChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, true);
    expect(opening.drops).toStrictEqual([]);
    expect(opening.bagDrops).toStrictEqual(COMMON_DROPS);
  });

  test("opens a chest only once", () => {
    expect.hasAssertions();

    const opened = new Set([CHEST_ID]);
    expect(openChest(commonChest, opened, EMPTY_WALLET, () => 0, false)).toStrictEqual({
      adventureExp: 0,
      bagDrops: [],
      drops: [],
      openedChestIds: opened,
      wallet: EMPTY_WALLET,
    });
  });

  test("a dug chest pays no reward until its tier is measured", () => {
    expect.hasAssertions();

    const dugChest = { ...commonChest, kind: ChestKind.Buried };
    expect(openChest(dugChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, false)).toStrictEqual({
      adventureExp: 0,
      bagDrops: [],
      drops: [],
      openedChestIds: NO_OPENED_CHESTS,
      wallet: EMPTY_WALLET,
    });
  });

  test("leaves a chest of a kind with no reward yet unopened", () => {
    expect.hasAssertions();

    const sealedChest = { ...commonChest, kind: ChestKind.Sealed };
    expect(openChest(sealedChest, NO_OPENED_CHESTS, EMPTY_WALLET, () => 0, false)).toStrictEqual({
      adventureExp: 0,
      bagDrops: [],
      drops: [],
      openedChestIds: NO_OPENED_CHESTS,
      wallet: EMPTY_WALLET,
    });
  });
});
