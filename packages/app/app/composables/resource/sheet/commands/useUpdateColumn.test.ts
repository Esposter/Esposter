// @vitest-environment nuxt
import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createDateColumn } from "@/composables/resource/sheet/commands/createDateColumn.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne, toRawDeep } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useUpdateColumn, () => {
  setupCommandTest();

  test("sets description on column", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));

    expect(takeOne(dataSource.columns).description).toBe(" ");
  });

  test("undo restores original description", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
    undo(dataSource);

    expect(takeOne(dataSource.columns).description).toBe("");
  });

  test("renames column and updates row keys", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));

    expect(takeOne(dataSource.columns).name).toBe("renamed");
    expect(takeOne(dataSource.rows).data.renamed).toBe(0);
    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
  });

  test("undo restores original column name and row keys", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(dataSource);

    expect(takeOne(dataSource.columns).name).toBe("");
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows).data.renamed).toBeUndefined();
  });

  test("redo re-applies update after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.columns).name).toBe("renamed");
    expect(takeOne(dataSource.rows).data.renamed).toBe(0);
  });

  test("preserves row.data key order after rename", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? [], 1);
    await updateColumn("b", Object.assign(structuredClone(toRawDeep(column)), { name: "b_renamed" }));

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b_renamed", "c"]);
  });

  test("undo preserves row.data key order after rename restore", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? [], 1);
    await updateColumn("b", Object.assign(structuredClone(toRawDeep(column)), { name: "b_renamed" }));
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("reformats date values when format changes", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createDateColumn("date", DateFormat["YYYY-MM-DD"])],
      [createRow({ date: "2024-01-15" }), createRow({ date: "2024-06-30" })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("date", Object.assign(structuredClone(toRawDeep(column)), { format: DateFormat["DD/MM/YYYY"] }));

    expect(takeOne(dataSource.rows).data.date).toBe("15/01/2024");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("30/06/2024");
    expect(takeOne(dataSource.columns).size).toBeGreaterThan(0);
  });

  test("undo restores original date values after format change", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createDateColumn("date", DateFormat["YYYY-MM-DD"])],
      [createRow({ date: "2024-01-15" }), createRow({ date: "2024-06-30" })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const originalColumn = takeOne(dataSource?.columns ?? []);
    await updateColumn(
      "date",
      Object.assign(structuredClone(toRawDeep(originalColumn)), { format: DateFormat["DD/MM/YYYY"] }),
    );
    undo(dataSource);

    expect(takeOne(dataSource.rows).data.date).toBe("2024-01-15");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("2024-06-30");

    const updatedColumn = takeOne(dataSource.columns);

    assert.instanceOf(updatedColumn, DateColumn);

    expect(updatedColumn.format).toBe(DateFormat["YYYY-MM-DD"]);
  });

  test("recasts String values to Number when type changes", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("score")], [createRow({ score: "42" }), createRow({ score: "7" })]);
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("score", Object.assign(structuredClone(toRawDeep(column)), { type: ColumnType.Number }));

    expect(takeOne(dataSource.rows).data.score).toBe(42);
    expect(takeOne(dataSource.rows, 1).data.score).toBe(7);
  });

  test("recasts Number values to String when type changes", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createNumberColumn("score")], [createRow({ score: 42 }), createRow({ score: 7 })]);
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("score", Object.assign(structuredClone(toRawDeep(column)), { type: ColumnType.String }));

    expect(takeOne(dataSource.rows).data.score).toBe("42");
    expect(takeOne(dataSource.rows, 1).data.score).toBe("7");
  });

  test("recasts String values to Boolean when type changes", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("flag")],
      [createRow({ flag: BooleanValue.True }), createRow({ flag: BooleanValue.False })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("flag", Object.assign(structuredClone(toRawDeep(column)), { type: ColumnType.Boolean }));

    expect(takeOne(dataSource.rows).data.flag).toBe(true);
    expect(takeOne(dataSource.rows, 1).data.flag).toBe(false);
  });

  test("undo restores original values after type recast", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("score")], [createRow({ score: "42" }), createRow({ score: "7" })]);
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await updateColumn("score", Object.assign(structuredClone(toRawDeep(column)), { type: ColumnType.Number }));
    undo(dataSource);

    expect(takeOne(dataSource.rows).data.score).toBe("42");
    expect(takeOne(dataSource.rows, 1).data.score).toBe("7");
    expect(takeOne(dataSource.columns).type).toBe(ColumnType.String);
  });

  test("does not recast values when type is unchanged", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createNumberColumn("score")], [createRow({ score: 42 })]);
    const { dataSource } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource?.columns ?? []);
    const originalSize = column.size;
    await updateColumn("score", Object.assign(structuredClone(toRawDeep(column)), { description: "updated" }));

    expect(takeOne(dataSource.rows).data.score).toBe(42);
    expect(takeOne(dataSource.columns).size).toBe(originalSize);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    const updatedColumn = reactive(Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    await updateColumn("", updatedColumn);
    updatedColumn.name = "mutated";
    undo(dataSource);
    const dataSourceAfterUndo = dataSource;

    assert.exists(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.columns).name).toBe("");

    redo(dataSource);
    const dataSourceAfterRedo = dataSource;

    assert.exists(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.columns).name).toBe("renamed");
  });
});
