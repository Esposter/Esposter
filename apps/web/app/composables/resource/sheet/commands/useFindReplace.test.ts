// @vitest-environment nuxt
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { describe, expect, test } from "vitest";

describe(useFindReplace, () => {
  setupCommandTest();

  test("replaces all matching cells across rows and columns", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " }), createRow({ "": " ", " ": 0 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": "", " ": "" },
      { "": "", " ": 0 },
    ]);
  });

  test("replaces substrings within cell values", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": "a " })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "a" }]);
  });

  test("replaces only the specific cell when specificCell is provided", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": " ", " ": " " })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": "", " ": " " }]);
  });

  test("preserves number type after replace", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createNumberColumn("")], [createRow({ "": 1 })]);
    const { dataSource } = setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    findReplace("1", "2");

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": 2 }]);
  });

  test("description shows row number when replacing a single occurrence", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": 0 })]);
    setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(undoDescription.value).toBe(`Find & Replace " " → "" on row 1`);
  });

  test("description shows all when replacing across multiple rows", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource([createColumn("")], [createRow({ "": " " }), createRow({ "": " " })]);
    setupWithDataSource(initialDataSource);
    const findReplace = useFindReplace();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    findReplace(" ", "");

    expect(undoDescription.value).toBe(`Find & Replace " " → "" (all)`);
  });
});
