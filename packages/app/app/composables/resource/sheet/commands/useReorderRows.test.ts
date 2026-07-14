// @vitest-environment nuxt
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useReorderRows, () => {
  setupCommandTest();

  test("moves row forward (index 0 to 1)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const rows = dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows)] as Row[];
    await reorderRows(newRows);

    expect(takeOne(dataSource.rows).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
  });

  test("undo restores original row order", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const rows = dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows)] as Row[];
    await reorderRows(newRows);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies reorder after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const rows = dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows)] as Row[];
    await reorderRows(newRows);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
  });

  test("moves row backward (index 2 to 0) with three rows", async () => {
    expect.hasAssertions();

    const threeRowDs = createDataSource(
      [createColumn("")],
      [createRow({ "": 0 }), createRow({ "": 1 }), createRow({ "": 2 })],
    );
    const { dataSource } = setupWithDataSource(threeRowDs);
    const reorderRows = useReorderRows();
    const rows = dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 2), takeOne(rows), takeOne(rows, 1)] as Row[];
    await reorderRows(newRows);

    expect(takeOne(dataSource.rows).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(1);
  });

  test("moves row forward non-adjacent (index 0 to 2) with three rows", async () => {
    expect.hasAssertions();

    const threeRowDs = createDataSource(
      [createColumn("")],
      [createRow({ "": 0 }), createRow({ "": 1 }), createRow({ "": 2 })],
    );
    const { dataSource } = setupWithDataSource(threeRowDs);
    const reorderRows = useReorderRows();
    const rows = dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 2), takeOne(rows)] as Row[];
    await reorderRows(newRows);

    expect(takeOne(dataSource.rows).data[""]).toBe(1);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(0);
  });

  test("moves row forward on paginated page (index 2 to 4 with only page rows passed)", async () => {
    expect.hasAssertions();

    const sixRowDs = createDataSource(
      [createColumn("")],
      [
        createRow({ "": 0 }),
        createRow({ "": 1 }),
        createRow({ "": 2 }),
        createRow({ "": 3 }),
        createRow({ "": 4 }),
        createRow({ "": 5 }),
      ],
    );
    const { dataSource } = setupWithDataSource(sixRowDs);
    const reorderRows = useReorderRows();
    const rows = dataSource?.rows ?? [];
    // Simulate page 2 showing rows [2,3,4] — move row 2 to the end of the page
    const newRows = [takeOne(rows, 3), takeOne(rows, 4), takeOne(rows, 2)] as Row[];
    await reorderRows(newRows);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(1);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(3);
    expect(takeOne(dataSource.rows, 3).data[""]).toBe(4);
    expect(takeOne(dataSource.rows, 4).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 5).data[""]).toBe(5);
  });

  test("moves row backward on paginated page (index 4 to 2 with only page rows passed)", async () => {
    expect.hasAssertions();

    const sixRowDs = createDataSource(
      [createColumn("")],
      [
        createRow({ "": 0 }),
        createRow({ "": 1 }),
        createRow({ "": 2 }),
        createRow({ "": 3 }),
        createRow({ "": 4 }),
        createRow({ "": 5 }),
      ],
    );
    const { dataSource } = setupWithDataSource(sixRowDs);
    const reorderRows = useReorderRows();
    const rows = dataSource?.rows ?? [];
    // Simulate page 2 showing rows [2,3,4] — move row 4 to the start of the page
    const newRows = [takeOne(rows, 4), takeOne(rows, 2), takeOne(rows, 3)] as Row[];
    await reorderRows(newRows);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(1);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(4);
    expect(takeOne(dataSource.rows, 3).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 4).data[""]).toBe(3);
    expect(takeOne(dataSource.rows, 5).data[""]).toBe(5);
  });
});
