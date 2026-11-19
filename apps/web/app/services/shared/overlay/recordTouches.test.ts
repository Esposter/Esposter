import type { KeyedView } from "#src/models/shared/overlay/KeyedView";

import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { createTable } from "#src/services/shared/overlay/createTable";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { describe, expect, test } from "vitest";

describe(recordTouches, () => {
  const rowTable = sqliteTable("row", {
    deletedAt: integer({ mode: "timestamp_ms" }),
    id: text().primaryKey(),
    name: text().notNull(),
    version: integer().notNull(),
  });
  const table = createTable(rowTable);
  const name = "";

  test("records the keys of the rows an entry reads and writes", () => {
    expect.hasAssertions();

    const slotFor = createSlotFor();

    expect(
      recordTouches(slotFor, (view) => {
        view.get(table, ["a"]);
        view.set(table, ["b"], { deletedAt: null, id: "b", name, version: 0 });
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
        view.set(table, ["b"], { deletedAt: null, id: "b", name, version: 0 });
      }),
    ).toHaveLength(1);
    expect(slotFor(table).list()).toStrictEqual([]);
  });

  test("touches the same keys on two states that differ in other rows", () => {
    expect.hasAssertions();

    const entry = (view: KeyedView) => {
      view.get(table, ["a"]);
      view.set(table, ["b"], { deletedAt: null, id: "b", name, version: 0 });
    };
    const emptySlotFor = createSlotFor();
    const populatedSlotFor = createSlotFor();
    populatedSlotFor(table).arrive({ deletedAt: null, id: "a", name, version: 1 });
    populatedSlotFor(table).arrive({ deletedAt: null, id: "c", name, version: 3 });

    expect(recordTouches(populatedSlotFor, entry)).toStrictEqual(recordTouches(emptySlotFor, entry));
  });
});
