// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/file/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useFindReplace, () => {
  setupCommandTest();

  test("replaces all matching cells across rows and columns", () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": 0 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe(0);
  });

  test("replaces substrings within cell values", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": "a " })]);
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(takeOne(dataSource.rows).data[""]).toBe("a");
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;

    findReplace(" ", "");
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies replacements after undo", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;

    findReplace(" ", "");
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
  });

  test("replaces only the specific cell when specificCell is provided", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn(""), createColumn(" ")], [createRow({ "": " ", " ": " " })]);
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe(" ");
  });

  test("preserves number type after replace", () => {
    expect.hasAssertions();

    const ds = createDataSource([createNumberColumn("")], [createRow({ "": 1 })]);
    const { dataSource } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace("1", "2");

    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("description shows row number when replacing a single occurrence", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": 0 })]);
    setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(undoDescription.value).toBe(`Find & Replace " " → "" on row 1`);
  });

  test("description shows all when replacing across multiple rows", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    findReplace(" ", "");

    expect(undoDescription.value).toBe(`Find & Replace " " → "" (all)`);
  });
});
