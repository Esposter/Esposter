// @vitest-environment nuxt
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useResourceStore } from "#src/store/resource/index";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useSetDataSource, () => {
  setupCommandTest();

  test("sets the data section", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetStore = useSheetStore();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
    const newDataSource = createDataSource();
    setDataSource(newDataSource);

    expect(sheetStore.dataSource).toStrictEqual(newDataSource);
  });

  test("clears undo and redo history after setting data source", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    deleteRow(takeOne(dataSource.rows).id);

    expect(isUndoable.value).toBe(true);

    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    setDataSource(createDataSource());

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  // An import awaits a revision or a dataset read before it writes, so the reader can have opened another sheet by
  // Then — written there, one sheet's import would replace another's data
  test("writes nothing once the sheet it was started on is no longer open", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const getDataSourceSetter = useSetDataSource();
    const setDataSource = getDataSourceSetter();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { clearResource } = resourceStore;
    assert.exists(resource.value);
    clearResource(resource.value.id);
    setDataSource(createDataSource([], []));
    const sheetStore = useSheetStore();

    expect(sheetStore.dataSource).toStrictEqual(dataSource);
  });
});
