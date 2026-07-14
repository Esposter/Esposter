// @vitest-environment nuxt
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useCreateRow, () => {
  setupCommandTest();

  test("appends a new row with null values for all columns", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    await createRow();

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 2).data[" "]).toBeNull();
  });

  test("appends a pre-built row with provided data", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    await createRow(new Row({ data: { "": 0, " ": 1 } }));

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 2).data[" "]).toBe(1);
  });

  test("undo removes the created row", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    await createRow();
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies create after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    await createRow();
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(3);
  });

  test("creates a unique id when the same row instance is passed multiple times", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const row = new Row({ data: { "": 0, " ": 1 } });
    await createRow(row);
    await createRow(row);

    const firstRow = takeOne(dataSource.rows, 2);
    const secondRow = takeOne(dataSource.rows, 3);

    expect(dataSource.rows).toHaveLength(4);
    expect(firstRow.id).not.toBe(secondRow.id);
    expect(firstRow).toStrictEqual(
      Object.assign(secondRow, {
        createdAt: firstRow.createdAt,
        id: firstRow.id,
        updatedAt: firstRow.updatedAt,
      }),
    );
  });
});
