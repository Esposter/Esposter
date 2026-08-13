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
    await updateColumn("", createUpdatedColumn(column, { name: "renamed" }));

    expect(takeOne(dataSource.columns).name).toBe("renamed");
    expect(takeOne(dataSource.rows).data.renamed).toBe(0);
    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
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
    await updateColumn("b", createUpdatedColumn(column, { name: "b_renamed" }));

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b_renamed", "c"]);

    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("reformats date values when format changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createDateColumn("date", DateFormat["YYYY-MM-DD"])],
      [createRow({ date: "2024-01-15" }), createRow({ date: "2024-06-30" })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    await updateColumn("date", createUpdatedColumn(column, { format: DateFormat["DD/MM/YYYY"] }));

    expect(takeOne(dataSource.rows).data.date).toBe("15/01/2024");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("30/06/2024");
    expect(takeOne(dataSource.columns).size).toBeGreaterThan(0);

    undo(dataSource);
    const restoredColumn = takeOne(dataSource.columns);

    assert.instanceOf(restoredColumn, DateColumn);

    expect(takeOne(dataSource.rows).data.date).toBe("2024-01-15");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("2024-06-30");
    expect(restoredColumn.format).toBe(DateFormat["YYYY-MM-DD"]);
  });

  test("recasts String values to Number when type changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("score")],
      [createRow({ score: "42" }), createRow({ score: "7" })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    await updateColumn("score", createUpdatedColumn(column, { type: ColumnType.Number }));

    expect(takeOne(dataSource.rows).data.score).toBe(42);
    expect(takeOne(dataSource.rows, 1).data.score).toBe(7);

    undo(dataSource);

    expect(takeOne(dataSource.rows).data.score).toBe("42");
    expect(takeOne(dataSource.rows, 1).data.score).toBe("7");
    expect(takeOne(dataSource.columns).type).toBe(ColumnType.String);
  });

  test("recasts Number values to String when type changes", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createNumberColumn("score")],
      [createRow({ score: 42 }), createRow({ score: 7 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    await updateColumn("score", createUpdatedColumn(column, { type: ColumnType.String }));

    expect(takeOne(dataSource.rows).data.score).toBe("42");
    expect(takeOne(dataSource.rows, 1).data.score).toBe("7");
  });

  test("does not recast values when type is unchanged", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createNumberColumn("score")], [createRow({ score: 42 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const updateColumn = useUpdateColumn();
    const column = takeOne(dataSource.columns);
    const originalSize = column.size;
    await updateColumn("score", createUpdatedColumn(column, { description: "updated" }));

    expect(takeOne(dataSource.rows).data.score).toBe(42);
    expect(takeOne(dataSource.columns).size).toBe(originalSize);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const column = takeOne(dataSource.columns);
    const updatedColumn = reactive(createUpdatedColumn(column, { name: "renamed" }));
    await updateColumn("", updatedColumn);
    updatedColumn.name = "mutated";
    undo(dataSource);

    expect(takeOne(dataSource.columns).name).toBe("");

    redo(dataSource);

    expect(takeOne(dataSource.columns).name).toBe("renamed");
  });
});
