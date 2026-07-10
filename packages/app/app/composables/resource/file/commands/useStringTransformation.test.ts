// @vitest-environment nuxt
import { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { StringTransformationType } from "#shared/models/resource/file/column/transformation/string/StringTransformationType";
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useStringTransformation, () => {
  setupCommandTest();

  test(`${StringTransformationType.Trim} strips whitespace from all string cells`, () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe("");
  });

  test(`${StringTransformationType.LowerCase} lowercases all string cells`, () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "A" })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.LowerCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("a");
  });

  test(`${StringTransformationType.UpperCase} uppercases all string cells`, () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "a" })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.UpperCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("A");
  });

  test(`${StringTransformationType.TitleCase} title-cases all string cells`, () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "a b" })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.TitleCase);

    expect(takeOne(dataSource.rows).data[""]).toBe("A B");
  });

  test("skips non-string columns", () => {
    expect.hasAssertions();

    const numberColumn = new NumberColumn({ name: "", size: 0, sourceName: "" });
    const ds = createDataSource([numberColumn], [createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(isUndoable.value).toBe(false);
  });

  test("skips hidden columns", () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = createDataSource([hiddenColumn], [createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;

    stringTransformation(StringTransformationType.Trim);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;

    stringTransformation(StringTransformationType.Trim);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
  });

  test("description includes the transform", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " })]);
    setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);

    expect(undoDescription.value).toBe(`Format Strings (${StringTransformationType.Trim})`);
  });
});
