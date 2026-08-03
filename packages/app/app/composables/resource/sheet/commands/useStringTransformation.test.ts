// @vitest-environment nuxt
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useStringTransformation, () => {
  setupCommandTest();

  test(`${StringTransformationType.Trim} strips whitespace from all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe("");
  });

  test(`${StringTransformationType.LowerCase} lowercases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "A" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.LowerCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("a");
  });

  test(`${StringTransformationType.UpperCase} uppercases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.UpperCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("A");
  });

  test(`${StringTransformationType.TitleCase} title-cases all string cells`, async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a b" })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    await stringTransformation(StringTransformationType.TitleCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("A B");
  });

  test("skips non-string columns", async () => {
    expect.hasAssertions();

    const numberColumn = new NumberColumn({ name: "", size: 0, sourceName: "" });
    const initialDataSource = createDataSource([numberColumn], [createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(isUndoable.value).toBe(false);
  });

  test("skips hidden columns", async () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "", size: 0, sourceName: "" });
    const initialDataSource = createDataSource([hiddenColumn], [createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores all original values", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;

    await stringTransformation(StringTransformationType.Trim);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies after undo", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;

    await stringTransformation(StringTransformationType.Trim);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
  });

  test("description includes the transform", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const stringTransformation = useStringTransformation();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await stringTransformation(StringTransformationType.Trim);

    expect(undoDescription.value).toBe(`Format Strings (${StringTransformationType.Trim})`);
  });
});
