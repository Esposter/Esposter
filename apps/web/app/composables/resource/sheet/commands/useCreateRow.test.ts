// @vitest-environment nuxt
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useCreateRow, () => {
  setupCommandTest();

  test("appends a new row with null values for all columns", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    await createRow();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 0, " ": 1 },
      { "": 2, " ": 3 },
      { "": null, " ": null },
    ]);
  });

  // A computed column's value is never stored, so a null under its name is a cell nothing wrote — and one that reads
  // As empty to anything walking the row, however full the columns it derives from are
  test("stores nothing for a computed column", async () => {
    expect.hasAssertions();

    const column = createNumberColumn("");
    const { dataSource } = setupWithDataSource(createDataSource([column, createComputedColumn(" ", column.id)], []));
    const createRow = useCreateRow();
    await createRow();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": null }]);
  });

  test("appends a pre-built row with provided data", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    await createRow(new Row({ data: { "": 0, " ": 1 } }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 0, " ": 1 },
      { "": 2, " ": 3 },
      { "": 0, " ": 1 },
    ]);
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
      Object.assign(secondRow, { createdAt: firstRow.createdAt, id: firstRow.id, updatedAt: firstRow.updatedAt }),
    );
  });
});
