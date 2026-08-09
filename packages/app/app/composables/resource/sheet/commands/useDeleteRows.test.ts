// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteRows, () => {
  setupCommandTest();

  test("removes all specified rows by id", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    await deleteRows([takeOne(dataSource.rows).id, takeOne(dataSource.rows, 1).id]);

    expect(dataSource.rows).toHaveLength(0);
  });

  test("removes only the specified rows", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    await deleteRows([takeOne(dataSource.rows).id]);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });
});
