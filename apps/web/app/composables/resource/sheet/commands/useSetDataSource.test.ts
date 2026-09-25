// @vitest-environment nuxt
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useSetDataSource, () => {
  setupCommandTest();

  test("sets the data section", async () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetStore = useSheetStore();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
    const newDataSource = createDataSource();
    await setDataSource(newDataSource);

    expect(sheetStore.dataSource).toStrictEqual(newDataSource);
  });

  test("clears undo and redo history after setting data source", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
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

  // An import awaits a revision or a dataset read before it writes, so the reader can have opened another sheet by
  // Then — written there, one sheet's import would replace another's data
  test("writes nothing once the sheet it was started on is no longer open", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { clearResource } = resourceStore;
    assert.exists(resource.value);
    clearResource(resource.value.id);
    await setDataSource(createDataSource([], []));
    const sheetStore = useSheetStore();

    expect(sheetStore.dataSource).toStrictEqual(dataSource);
  });
});
