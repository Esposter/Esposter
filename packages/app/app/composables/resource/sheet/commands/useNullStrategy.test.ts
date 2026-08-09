// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useNullStrategy, () => {
  setupCommandTest();

  test(`${NullStrategy.ReplaceWithNA} replaces null in string columns with "N/A"`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} replaces empty string in string columns with "N/A"`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.DropRow} drops rows with null cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": null, " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
  });

  test(`${NullStrategy.DropRow} drops rows with empty string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "" }), createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
  });

  test(`${NullStrategy.ReplaceWithNA} no-op when no null or empty string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.DropRow} no-op when no rows have null or empty string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await nullStrategy(NullStrategy.DropRow);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the strategy", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": null })]);
    setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(undoDescription.value).toBe(`Null Strategy (${NullStrategy.ReplaceWithNA})`);
  });
});
