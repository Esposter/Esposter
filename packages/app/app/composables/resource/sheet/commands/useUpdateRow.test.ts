// @vitest-environment nuxt
import { createUpdatedRow } from "@/composables/resource/sheet/commands/createUpdatedRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useUpdateRow, () => {
  setupCommandTest();

  test("updates row data at given index", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const originalRow = takeOne(dataSource.rows);
    await updateRow(createUpdatedRow(originalRow, { data: { "": 10, " ": 11 } }));

    expect(takeOne(dataSource.rows).data[""]).toBe(10);
    expect(takeOne(dataSource.rows).data[" "]).toBe(11);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const originalRow = takeOne(dataSource.rows);
    const updatedRow = reactive(createUpdatedRow(originalRow, { data: { "": 10, " ": 11 } }));
    await updateRow(updatedRow);
    updatedRow.data[""] = 99;
    updatedRow.data[" "] = 99;
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows).data[" "]).toBe(1);

    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(10);
    expect(takeOne(dataSource.rows).data[" "]).toBe(11);
  });
});
