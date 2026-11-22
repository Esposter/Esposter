// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { usePasteRangeFromClipboard } from "#src/composables/resource/sheet/commands/usePasteRangeFromClipboard";
import { PasteMode } from "#src/models/resource/sheet/commands/PasteMode";
import { copyToClipboard } from "#src/services/resource/sheet/commands/copyToClipboard";
import { useResourceStore } from "#src/store/resource/index";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const selectAnchor = (rowIndex: number, columnIndex: number) => {
  const cellStore = useCellStore();
  const { startCellSelection } = cellStore;
  startCellSelection(rowIndex, columnIndex);
};

const createSingleCellDataSource = () => createDataSource([createColumn("a")], [createRow({ a: "1" })]);

// A clipboard item as a paste reads it: its types, and the blob of each type by name
const createClipboardItem = (blobs: Record<string, Blob>) => ({
  getType: (type: string) => {
    const blob = blobs[type];
    assert.exists(blob);
    return Promise.resolve(blob);
  },
  types: Object.keys(blobs),
});

describe(usePasteRangeFromClipboard, () => {
  let readTextMock: ReturnType<typeof vi.fn<() => Promise<string>>>;

  setupCommandTest();

  beforeEach(() => {
    readTextMock = vi.fn<() => Promise<string>>().mockResolvedValue("");
    // The text each test mocks is the one plain-text item on the clipboard
    vi.stubGlobal("navigator", {
      clipboard: {
        read: async () => [createClipboardItem({ [MimeType.PlainText]: new Blob([await readTextMock()]) })],
      },
    });
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
    ["over an existing row", PasteMode.Overwrite, 0, [{ a: "2" }]],
    ["into an appended row", PasteMode.Overwrite, 1, [{ a: "1" }, { a: "2" }]],
    ["into a shifted-down row", PasteMode.ShiftDown, 0, [{ a: "2" }, { a: "1" }]],
  ])("stores nothing for a computed column %s", async (_title, pasteMode, anchorRowIndex, expectedRows) => {
    expect.hasAssertions();

    const column = createColumn("a");
    const { dataSource } = setupWithDataSource(
      createDataSource([column, createComputedColumn("b", column.id)], [createRow({ a: "1" })]),
    );
    readTextMock.mockResolvedValueOnce("2	3");
    selectAnchor(anchorRowIndex, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard(pasteMode);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual(expectedRows);
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

  // The clipboard read is awaited, and a switch during it moves the open sheet and its selection to another sheet, so
  // A paste issued for the first sheet must not land on the one that replaced it
  test("writes nothing to another sheet when the open sheet changes while the clipboard is read", async () => {
    expect.hasAssertions();

    setupWithDataSource(createSingleCellDataSource());
    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    const sheetStore = useSheetStore();
    const { sheetResource } = storeToRefs(sheetStore);
    const otherDataSource = createSingleCellDataSource();
    readTextMock.mockImplementationOnce(() => {
      applyResource(createResourceListItem(), null);
      sheetResource.value.data = otherDataSource;
      return Promise.resolve("2");
    });
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(otherDataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "1" }]);
  });

  // A copy writes the exact values under the sheet's own format beside its text, and an in-app paste reads that format,
  // So a value the text is made formula-safe for comes back unchanged
  test("pastes the exact values an in-app copy wrote, not the formula-safe text", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createSingleCellDataSource());
    const copiedItems: Record<string, Blob>[] = [];
    vi.stubGlobal(
      "ClipboardItem",
      class {
        items: Record<string, Blob>;

        constructor(items: Record<string, Blob>) {
          this.items = items;
          copiedItems.push(items);
        }
      },
    );
    vi.stubGlobal("navigator", {
      clipboard: {
        read: () => Promise.resolve(copiedItems.map((items) => createClipboardItem(items))),
        write: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      },
    });
    await copyToClipboard(createDataSource([createColumn("a")], [createRow({ a: "=1+1" })]), {
      isIncludingHeaders: false,
    });
    selectAnchor(0, 0);
    const pasteRangeFromClipboard = usePasteRangeFromClipboard();
    await pasteRangeFromClipboard();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ a: "=1+1" }]);
  });
});
