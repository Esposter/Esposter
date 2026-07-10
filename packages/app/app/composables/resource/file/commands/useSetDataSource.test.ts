// @vitest-environment nuxt
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { useFileStore } from "@/store/resource/file";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useSetDataSource, () => {
  setupCommandTest();

  test("sets the data section", async () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileStore = useFileStore();
    const setDataSource = useSetDataSource();
    const newDataSource = createDataSource();
    await setDataSource(newDataSource);

    expect(fileStore.dataSource).toStrictEqual(newDataSource);
  });

  test("clears undo and redo history after setting data source", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const setDataSource = useSetDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    await deleteRow(takeOne(dataSource.rows).id);

    expect(isUndoable.value).toBe(true);

    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    await setDataSource(createDataSource());

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });
});
