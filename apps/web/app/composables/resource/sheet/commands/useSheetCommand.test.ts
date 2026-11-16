// @vitest-environment nuxt
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useSheetCommand, () => {
  setupCommandTest();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("saves once for the command it pushes", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const sheetStore = useSheetStore();
    const saveSheet = vi.spyOn(sheetStore, "saveSheet");
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const createRow = useCreateRow();
    createRow();

    expect(dataSource.rows).toHaveLength(3);
    expect(isUndoable.value).toBe(true);
    expect(saveSheet).toHaveBeenCalledExactlyOnceWith();
  });

  test("does not save when no command is created", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetStore = useSheetStore();
    const saveSheet = vi.spyOn(sheetStore, "saveSheet");
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const deleteRow = useDeleteRow();
    deleteRow("-1");

    expect(isUndoable.value).toBe(false);
    expect(saveSheet).not.toHaveBeenCalled();
  });
});
