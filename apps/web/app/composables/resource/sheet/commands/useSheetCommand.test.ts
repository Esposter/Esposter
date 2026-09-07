// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useSheetCommand, () => {
  setupCommandTest();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("saves once for the command it pushes", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const sheetStore = useSheetStore();
    const saveSheet = vi.spyOn(sheetStore, "saveSheet");
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const createRow = useCreateRow();
    await createRow();

    expect(dataSource.rows).toHaveLength(3);
    expect(isUndoable.value).toBe(true);
    expect(saveSheet).toHaveBeenCalledExactlyOnceWith();
  });

  test("does not save when no command is created", async () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetStore = useSheetStore();
    const saveSheet = vi.spyOn(sheetStore, "saveSheet");
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const deleteRow = useDeleteRow();
    await deleteRow("-1");

    expect(isUndoable.value).toBe(false);
    expect(saveSheet).not.toHaveBeenCalled();
  });
});
