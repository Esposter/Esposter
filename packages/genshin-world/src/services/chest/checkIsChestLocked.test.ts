import type { ChestLockSource } from "#src/models/chest/ChestLockSource";

import { checkIsChestLocked } from "#src/services/chest/checkIsChestLocked";
import { describe, expect, test } from "vitest";

describe(checkIsChestLocked, () => {
  const CHEST_POSITION = { x: 0, z: 0 };
  const REACH = 5;
  const NEAR_POSITION = { x: 3, z: 0 };
  const FAR_POSITION = { x: 9, z: 0 };

  test("a chest stays locked while a camp within its reach stands", () => {
    expect.hasAssertions();

    const camp: ChestLockSource = { isDone: false, positions: [NEAR_POSITION] };
    expect(checkIsChestLocked(CHEST_POSITION, [camp], REACH)).toBe(true);
  });

  test("a chest opens once the camp within its reach is cleared", () => {
    expect.hasAssertions();

    const clearedCamp: ChestLockSource = { isDone: true, positions: [NEAR_POSITION] };
    expect(checkIsChestLocked(CHEST_POSITION, [clearedCamp], REACH)).toBe(false);
  });

  test("a chest stays locked while a puzzle within its reach is unsolved", () => {
    expect.hasAssertions();

    const puzzle: ChestLockSource = { isDone: false, positions: [NEAR_POSITION] };
    expect(checkIsChestLocked(CHEST_POSITION, [puzzle], REACH)).toBe(true);
  });

  test("a chest is not locked by a camp beyond its reach", () => {
    expect.hasAssertions();

    const camp: ChestLockSource = { isDone: false, positions: [FAR_POSITION] };
    expect(checkIsChestLocked(CHEST_POSITION, [camp], REACH)).toBe(false);
  });
});
