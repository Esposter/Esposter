// @vitest-environment nuxt
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createThreeColumnDataSource = () =>
  createDataSource([createColumn("a"), createColumn("b"), createColumn("c")], [createRow({ a: 0, b: 1, c: 2 })]);

describe(useReorderColumns, () => {
  setupCommandTest();

  test("moves column forward (index 0 to 1)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const newColumns = [takeOne(dataSource.columns, 1), takeOne(dataSource.columns)] as StringColumn[];
    await reorderColumns(newColumns);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual([" ", ""]);
  });

  test("moves column backward (index 1 to 0) with three columns", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createThreeColumnDataSource());
    const reorderColumns = useReorderColumns();
    const newColumns = [
      takeOne(dataSource.columns, 1),
      takeOne(dataSource.columns),
      takeOne(dataSource.columns, 2),
    ] as StringColumn[];
    await reorderColumns(newColumns);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual(["b", "a", "c"]);
  });

  test("moves column forward non-adjacent (index 0 to 2) with three columns", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createThreeColumnDataSource());
    const reorderColumns = useReorderColumns();
    const newColumns = [
      takeOne(dataSource.columns, 1),
      takeOne(dataSource.columns, 2),
      takeOne(dataSource.columns),
    ] as StringColumn[];
    await reorderColumns(newColumns);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual(["b", "c", "a"]);
  });
});
