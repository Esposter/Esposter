// @vitest-environment nuxt
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useCreateRows, () => {
  setupCommandTest();

  test("appends at the end when no start index is given", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRows = useCreateRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    await createRows([new Row({ data: { "": 4, " ": 5 } }), new Row({ data: { "": 6, " ": 7 } })]);

    expect(dataSource.rows).toHaveLength(4);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(4);
    expect(takeOne(dataSource.rows, 3).data[""]).toBe(6);

    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("no-op when there are no rows to create", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRows = useCreateRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await createRows([]);

    expect(dataSource.rows).toHaveLength(2);
    expect(isUndoable.value).toBe(false);
  });
});
