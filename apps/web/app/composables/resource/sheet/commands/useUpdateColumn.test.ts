// @vitest-environment nuxt
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { createUpdatedColumn } from "@/composables/resource/sheet/commands/createUpdatedColumn.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useUpdateColumn, () => {
  setupCommandTest();

  test("sets description on column", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    await updateColumn("", createUpdatedColumn(column, { description: " " }));

    expect(takeOne(dataSource.columns).description).toBe(" ");
  });

  test("renames column and updates row keys", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    await updateColumn("", createUpdatedColumn(column, { name: "a" }));

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual(["a", " "]);
    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { " ": 1, a: 0 },
      { " ": 3, a: 2 },
    ]);
  });

  test("preserves row.data key order after rename", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns, 1);
    await updateColumn("b", createUpdatedColumn(column, { name: "d" }));

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "d", "c"]);

    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("reformats date values when format changes", async () => {
    expect.hasAssertions();

    // The second row is the epoch's next day, so the reformat's day-month order is read off its output
    const epochDate = new Date(0).toISOString().slice(0, 10);
    const nextDayDate = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString().slice(0, 10);
    const initialDataSource = createDataSource(
      [createDateColumn("", DateFormat["YYYY-MM-DD"])],
      [createRow({ "": epochDate }), createRow({ "": nextDayDate })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    await updateColumn("", createUpdatedColumn(column, { format: DateFormat["DD/MM/YYYY"] }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "01/01/1970" }, { "": "02/01/1970" }]);
    expect(takeOne(dataSource.columns).size).toBe(24);

    undo(dataSource);
    const restoredColumn = takeOne(dataSource.columns);

    assert.instanceOf(restoredColumn, DateColumn);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": epochDate }, { "": nextDayDate }]);
    expect(restoredColumn.format).toBe(DateFormat["YYYY-MM-DD"]);
  });

  test("recasts String values to Number when type changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("a")], [createRow({ a: "0" }), createRow({ a: "1" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    await updateColumn("a", createUpdatedColumn(column, { type: ColumnType.Number }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: 0 }, { a: 1 }]);

    undo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "0" }, { a: "1" }]);
    expect(takeOne(dataSource.columns).type).toBe(ColumnType.String);
  });

  test("recasts Number values to String when type changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createNumberColumn("a")], [createRow({ a: 0 }), createRow({ a: 1 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    await updateColumn("a", createUpdatedColumn(column, { type: ColumnType.String }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "0" }, { a: "1" }]);
  });

  test("does not recast values when type is unchanged", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createNumberColumn("a")], [createRow({ a: 0 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    const originalSize = column.size;
    await updateColumn("a", createUpdatedColumn(column, { description: " " }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: 0 }]);
    expect(takeOne(dataSource.columns).size).toBe(originalSize);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    const updatedColumn = reactive(createUpdatedColumn(column, { name: "a" }));
    await updateColumn("", updatedColumn);
    updatedColumn.name = "b";
    undo(dataSource);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual(["", " "]);

    redo(dataSource);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual(["a", " "]);
  });
});
