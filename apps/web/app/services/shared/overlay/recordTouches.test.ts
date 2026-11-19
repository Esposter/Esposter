import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { Table } from "#src/models/shared/overlay/Table";

import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { describe, expect, test } from "vitest";

interface TestRow {
  id: string;
  name: string;
  version: number;
}

describe(recordTouches, () => {
  const table: Table<TestRow> = { keyOf: (row) => [row.id], name: "row" };
  const name = "";

  test("records the keys of the rows an entry reads and writes", () => {
    expect.hasAssertions();

    const slotFor = createSlotFor();

    expect(
      recordTouches(slotFor, (view) => {
        view.get(table, ["a"]);
        view.set(table, ["b"], { id: "b", name, version: 0 });
      }),
    ).toStrictEqual([
      { key: ["a"], table: "row" },
      { key: ["b"], table: "row" },
    ]);
  });

  test("discards the writes an entry makes, leaving held state as it was", () => {
    expect.hasAssertions();

    const slotFor = createSlotFor();

    expect(
      recordTouches(slotFor, (view) => {
        view.set(table, ["b"], { id: "b", name, version: 0 });
      }),
    ).toHaveLength(1);
    expect(slotFor(table).list()).toStrictEqual([]);
  });

  test("touches the same keys on two states that differ in other rows", () => {
    expect.hasAssertions();

    const entry = (view: KeyedView) => {
      view.get(table, ["a"]);
      view.set(table, ["b"], { id: "b", name, version: 0 });
    };
    const emptySlotFor = createSlotFor();
    const populatedSlotFor = createSlotFor();
    populatedSlotFor(table).arrive({ id: "a", name, version: 1 });
    populatedSlotFor(table).arrive({ id: "c", name, version: 3 });

    expect(recordTouches(populatedSlotFor, entry)).toStrictEqual(recordTouches(emptySlotFor, entry));
  });
});
