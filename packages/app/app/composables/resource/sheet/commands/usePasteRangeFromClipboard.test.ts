// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { usePasteRangeFromClipboard } from "@/composables/resource/sheet/commands/usePasteRangeFromClipboard";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
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
    readTextMock.mockResolvedValueOnce("10\t20");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(takeOne(dataSource.rows).data.a).toBe("10");
    expect(takeOne(dataSource.rows).data.b).toBe("20");
  });

  test("overwrites only the columns from the column anchor on", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(
      createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]),
    );
    readTextMock.mockResolvedValueOnce("99");
    selectAnchor(0, 1);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(takeOne(dataSource.rows).data.a).toBe("1");
    expect(takeOne(dataSource.rows).data.b).toBe("99");
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

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
    expect(takeOne(dataSource.rows, 2).data.a).toBe("3");

    undo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
  });

  test("appends at the end when no cell is selected", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    readTextMock.mockResolvedValueOnce("2");
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
  });

  test("coerces pasted values to the target column type", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createDataSource([createNumberColumn("n")], [createRow({ n: 1 })]));
    readTextMock.mockResolvedValueOnce("42");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(takeOne(dataSource.rows).data.n).toBe(42);
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

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows).data.a).toBe("1");
    expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
    expect(takeOne(dataSource.rows, 2).data.a).toBe("3");
  });

  test("writes nothing when the clipboard text is empty", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    readTextMock.mockResolvedValueOnce("");
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();
    const sheetHistoryStore = useSheetHistoryStore();

    expect(sheetHistoryStore.isUndoable).toBe(false);
    expect(takeOne(dataSource.rows).data.a).toBe("1");
  });
});
