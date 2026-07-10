// @vitest-environment nuxt
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/file/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { NullStrategy } from "@/models/resource/file/commands/NullStrategy";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useNullStrategy, () => {
  setupCommandTest();

  test(`${NullStrategy.ReplaceWithNA} replaces null in string columns with "N/A"`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} replaces empty string in string columns with "N/A"`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "" })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} skips non-string columns`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createNumberColumn("")], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBeNull();
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.ReplaceWithNA} skips hidden columns`, async () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = createDataSource([hiddenColumn], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(takeOne(dataSource.rows).data[""]).toBeNull();
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.DropRow} drops rows with null cells`, async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": null, " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
  });

  test(`${NullStrategy.DropRow} drops rows with empty string cells`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "" }), createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
  });

  test(`${NullStrategy.DropRow} skips hidden columns`, async () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = createDataSource([hiddenColumn], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.DropRow);

    expect(dataSource.rows).toHaveLength(1);
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.ReplaceWithNA} undo restores original values`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": null }), createRow({ "": "" })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;

    await nullStrategy(NullStrategy.ReplaceWithNA);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
  });

  test(`${NullStrategy.DropRow} undo restores deleted rows in original positions`, async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("")],
      [createRow({ "": null }), createRow({ "": " " }), createRow({ "": "" })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;

    await nullStrategy(NullStrategy.DropRow);
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 2).data[""]).toBe("");
  });

  test("redo re-applies after undo", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": null })]);
    const { dataSource } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;

    await nullStrategy(NullStrategy.ReplaceWithNA);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} no-op when no null or empty string cells`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.DropRow} no-op when no rows have null or empty string cells`, async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.DropRow);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the strategy", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": null })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    await nullStrategy(NullStrategy.ReplaceWithNA);

    expect(undoDescription.value).toBe(`Null Strategy (${NullStrategy.ReplaceWithNA})`);
  });
});
