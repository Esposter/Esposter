// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { usePasteRangeFromClipboard } from "@/composables/resource/sheet/commands/usePasteRangeFromClipboard";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const selectAnchor = (rowIndex: number, columnIndex: number) => {
  const cellStore = useCellStore();
  const { startCellSelection } = cellStore;
  startCellSelection(rowIndex, columnIndex);
};

const createSingleCellDataSource = () => createDataSource([createColumn("a")], [createRow({ a: "1" })]);

describe(usePasteRangeFromClipboard, () => {
  let readTextMock: ReturnType<typeof vi.fn<() => Promise<string>>>;

  setupCommandTest();

  beforeEach(() => {
    readTextMock = vi.fn<() => Promise<string>>().mockResolvedValue("");
    vi.stubGlobal("navigator", { clipboard: { readText: readTextMock } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("overwrites cells at the selection anchor", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(
      createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]),
    );
    readTextMock.mockResolvedValueOnce("3\t4");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "3", b: "4" }]);
  });

  test("overwrites only the columns from the column anchor on", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(
      createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]),
    );
    readTextMock.mockResolvedValueOnce("3");
    selectAnchor(0, 1);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1", b: "3" }]);
  });

  test("appends new rows when the pasted data extends past the last row", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    readTextMock.mockResolvedValueOnce("2\n3");
    selectAnchor(1, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }, { a: "2" }, { a: "3" }]);

    undo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }]);
  });

  test("appends at the end when no cell is selected", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    readTextMock.mockResolvedValueOnce("2");
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }, { a: "2" }]);
  });

  test("coerces pasted values to the target column type", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createDataSource([createNumberColumn("a")], [createRow({ a: 1 })]));
    readTextMock.mockResolvedValueOnce("0");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: 0 }]);
  });

  test("inserts rows at the anchor row in shift-down mode", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(
      createDataSource([createColumn("a")], [createRow({ a: "1" }), createRow({ a: "3" })]),
    );
    readTextMock.mockResolvedValueOnce("2");
    selectAnchor(1, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard(PasteMode.ShiftDown);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }, { a: "2" }, { a: "3" }]);
  });

  // A computed column stores nothing, so a pasted value landing on one — over an existing row, in a row appended past
  // The end or in one inserted by a shift-down — is dropped rather than stored under its name
  test.each([
    ["over an existing row", PasteMode.Overwrite, 0],
    ["into an appended row", PasteMode.Overwrite, 1],
    ["into a shifted-down row", PasteMode.ShiftDown, 0],
  ])("stores nothing for a computed column %s", async (_title, pasteMode, anchorRowIndex) => {
    expect.hasAssertions();

    const column = createColumn("a");
    const { dataSource } = setupWithDataSource(
      createDataSource([column, createComputedColumn("b", column.id)], [createRow({ a: "1" })]),
    );
    readTextMock.mockResolvedValueOnce("2	3");
    selectAnchor(anchorRowIndex, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard(pasteMode);

    expect(dataSource.rows.every(({ data }) => !Object.hasOwn(data, "b"))).toBe(true);
  });

  test("writes nothing when the clipboard text is empty", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    readTextMock.mockResolvedValueOnce("");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);

    expect(isUndoable.value).toBe(false);
    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }]);
  });
});
