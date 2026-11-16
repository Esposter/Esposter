// @vitest-environment nuxt
import { createUpdatedRow } from "#src/composables/resource/sheet/commands/createUpdatedRow.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useUpdateRow, () => {
  setupCommandTest();

  test("updates row data at given index", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const originalRow = takeOne(dataSource.rows);
    updateRow(createUpdatedRow(originalRow, { data: { "": 2, " ": 3 } }));

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 2, " ": 3 },
      { "": 2, " ": 3 },
    ]);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const originalRow = takeOne(dataSource.rows);
    const updatedRow = reactive(createUpdatedRow(originalRow, { data: { "": 2, " ": 3 } }));
    updateRow(updatedRow);
    updatedRow.data[""] = 4;
    updatedRow.data[" "] = 4;
    undo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 0, " ": 1 },
      { "": 2, " ": 3 },
    ]);

    redo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 2, " ": 3 },
      { "": 2, " ": 3 },
    ]);
  });
});
