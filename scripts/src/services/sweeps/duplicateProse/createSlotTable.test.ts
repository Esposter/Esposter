import { createSlotTable } from "#src/services/sweeps/duplicateProse/createSlotTable";
import { describe, expect, test } from "vitest";

describe(createSlotTable, () => {
  test("reports a key it never held as absent", () => {
    expect.hasAssertions();

    expect(createSlotTable(4).get(1)).toBeUndefined();
  });

  test("tells the first slot from an empty position", () => {
    expect.hasAssertions();

    const slotTable = createSlotTable(4);
    slotTable.set(7, 0);

    expect(slotTable.get(7)).toBe(0);
  });

  // Keys that differ by less than a position's width share a home, so the second one is found past the first
  test("holds two keys that share a home position", () => {
    expect.hasAssertions();

    const slotTable = createSlotTable(4);
    slotTable.set(1, 0);
    slotTable.set(2, 1);

    expect([slotTable.get(1), slotTable.get(2), slotTable.get(3)]).toStrictEqual([0, 1, undefined]);
  });
});
