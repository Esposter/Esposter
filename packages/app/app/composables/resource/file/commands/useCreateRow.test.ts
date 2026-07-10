// @vitest-environment nuxt
import { Row } from "#shared/models/resource/file/datasource/Row";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useCreateRow, () => {
  setupCommandTest();

  test("appends a new row with null values for all columns", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    createRow();

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 2).data[" "]).toBeNull();
  });

  test("appends a pre-built row with provided data", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    createRow(new Row({ data: { "": 0, " ": 1 } }));

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 2).data[" "]).toBe(1);
  });

  test("undo removes the created row", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    createRow();
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies create after undo", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    createRow();
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(3);
  });

  test("creates a unique id when the same row instance is passed multiple times", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const row = new Row({ data: { "": 0, " ": 1 } });
    createRow(row);
    createRow(row);

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
