// @vitest-environment nuxt
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createColumn as baseCreateColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useCreateColumn, () => {
  const SOURCE_COLUMN_NAME = "";

  setupCommandTest();

  test("appends a new column with null values for all rows", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const newColumn = new StringColumn({ name: "new", sourceName: "new" });
    await createColumn(newColumn);

    expect(dataSource.columns).toHaveLength(3);
    expect(takeOne(dataSource.columns, 2).name).toBe("new");
    expect(takeOne(dataSource.rows).data.new).toBeNull();
    expect(takeOne(dataSource.rows, 1).data.new).toBeNull();
  });

  test("creates a unique id when the same column instance is passed multiple times", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const newColumn = new StringColumn({ name: "new", sourceName: "new" });
    await createColumn(newColumn);
    await createColumn(newColumn);

    const firstColumn = takeOne(dataSource.columns, 2);
    const secondColumn = takeOne(dataSource.columns, 3);

    expect(dataSource.columns).toHaveLength(4);
    expect(firstColumn.id).not.toBe(secondColumn.id);
    expect(firstColumn).toStrictEqual(
      Object.assign(secondColumn, {
        createdAt: firstColumn.createdAt,
        id: firstColumn.id,
        updatedAt: firstColumn.updatedAt,
      }),
    );
  });

  test("adds a computed column to the data source", async () => {
    expect.hasAssertions();

    const sourceColumn = baseCreateColumn(SOURCE_COLUMN_NAME);
    const { dataSource } = setupWithDataSource(
      createDataSource([sourceColumn], [createRow({ [SOURCE_COLUMN_NAME]: 0 })]),
    );
    const createColumn = useCreateColumn();
    const newColumn = new ComputedColumn({
      name: " ",
      transformation: {
        sourceColumnId: sourceColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    await createColumn(newColumn);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 1)).toBeInstanceOf(ComputedColumn);
    // A computed column is derived at render time, so it must never materialise a key in row.data
    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual([SOURCE_COLUMN_NAME]);
  });
});
