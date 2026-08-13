// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useFindReplace, () => {
  setupCommandTest();

  test("replaces all matching cells across rows and columns", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": 0 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    await findReplace(" ", "");

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe(0);
  });

  test("replaces substrings within cell values", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    await findReplace(" ", "");

    expect(takeOne(dataSource.rows).data[""]).toBe("a");
  });

  test("replaces only the specific cell when specificCell is provided", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    await findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe(" ");
  });

  test("preserves number type after replace", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createNumberColumn("")], [createRow({ "": 1 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    await findReplace("1", "2");

    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("description shows row number when replacing a single occurrence", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": 0 })]);
    setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(undoDescription.value).toBe(`Find & Replace " " → "" on row 1`);
  });

  test("description shows all when replacing across multiple rows", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await findReplace(" ", "");

    expect(undoDescription.value).toBe(`Find & Replace " " → "" (all)`);
  });
});
