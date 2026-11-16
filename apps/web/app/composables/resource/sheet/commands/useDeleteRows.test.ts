// @vitest-environment nuxt
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteRows, () => {
  setupCommandTest();

  test("removes all specified rows by id", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    deleteRows([takeOne(dataSource.rows).id, takeOne(dataSource.rows, 1).id]);

    expect(dataSource.rows).toStrictEqual([]);
  });

  test("removes only the specified rows", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    deleteRows([takeOne(dataSource.rows).id]);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": 2, " ": 3 }]);
  });
});
