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

  // A null and an empty string are the same "no value" to the strategy, so both spellings take the same branch
  test.each([null, ""])(`${NullStrategy.ReplaceWithNA} rewrites a %j cell`, async (value) => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": value })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test.each([null, ""])(`${NullStrategy.DropRow} drops a row holding a %j cell`, async (value) => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": value, " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
  });

  test.each([NullStrategy.ReplaceWithNA, NullStrategy.DropRow])(
    "%s is a no-op when every cell has a value",
    async (strategy) => {
      expect.hasAssertions();

      const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
      setupWithDataSource(initialDataSource);
      const nullStrategy = useNullStrategy();
      const sheetHistoryStore = useSheetHistoryStore();
      const { isUndoable } = storeToRefs(sheetHistoryStore);
      await nullStrategy(strategy);

      expect(isUndoable.value).toBe(false);
    },
  );

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
