// @vitest-environment nuxt
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createThreeRowDataSource = () =>
  createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 1 }), createRow({ "": 2 })]);
const createSixRowDataSource = () =>
  createDataSource(
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

describe(useReorderRows, () => {
  setupCommandTest();

  test("moves row forward (index 0 to 1)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const newRows = [takeOne(dataSource.rows, 1), takeOne(dataSource.rows)] as Row[];
    await reorderRows(newRows);

    expect(dataSource.rows.map(({ data }) => takeOne(data, ""))).toStrictEqual([2, 0]);
  });

  test("moves row backward (index 2 to 0) with three rows", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createThreeRowDataSource());
    const reorderRows = useReorderRows();
    const newRows = [takeOne(dataSource.rows, 2), takeOne(dataSource.rows), takeOne(dataSource.rows, 1)] as Row[];
    await reorderRows(newRows);

    expect(dataSource.rows.map(({ data }) => takeOne(data, ""))).toStrictEqual([2, 0, 1]);
  });

  test("moves row forward non-adjacent (index 0 to 2) with three rows", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createThreeRowDataSource());
    const reorderRows = useReorderRows();
    const newRows = [takeOne(dataSource.rows, 1), takeOne(dataSource.rows, 2), takeOne(dataSource.rows)] as Row[];
    await reorderRows(newRows);

    expect(dataSource.rows.map(({ data }) => takeOne(data, ""))).toStrictEqual([1, 2, 0]);
  });

  test("moves row forward on paginated page (index 2 to 4 with only page rows passed)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSixRowDataSource());
    const reorderRows = useReorderRows();
    // Simulate page 2 showing rows [2,3,4] — move row 2 to the end of the page
    const newRows = [takeOne(dataSource.rows, 3), takeOne(dataSource.rows, 4), takeOne(dataSource.rows, 2)] as Row[];
    await reorderRows(newRows);

    expect(dataSource.rows.map(({ data }) => takeOne(data, ""))).toStrictEqual([0, 1, 3, 4, 2, 5]);
  });

  test("moves row backward on paginated page (index 4 to 2 with only page rows passed)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSixRowDataSource());
    const reorderRows = useReorderRows();
    // Simulate page 2 showing rows [2,3,4] — move row 4 to the start of the page
    const newRows = [takeOne(dataSource.rows, 4), takeOne(dataSource.rows, 2), takeOne(dataSource.rows, 3)] as Row[];
    await reorderRows(newRows);

    expect(dataSource.rows.map(({ data }) => takeOne(data, ""))).toStrictEqual([0, 1, 4, 2, 3, 5]);
  });
});
