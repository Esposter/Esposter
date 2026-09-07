// @vitest-environment nuxt
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useSetDataSource, () => {
  setupCommandTest();

  test("sets the data section", async () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetStore = useSheetStore();
    const setDataSource = useSetDataSource();
    const newDataSource = createDataSource();
    await setDataSource(newDataSource);

    expect(sheetStore.dataSource).toStrictEqual(newDataSource);
  });

  test("clears undo and redo history after setting data source", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const setDataSource = useSetDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource.rows).id);

    expect(isUndoable.value).toBe(true);

    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    await setDataSource(createDataSource());

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });
});
