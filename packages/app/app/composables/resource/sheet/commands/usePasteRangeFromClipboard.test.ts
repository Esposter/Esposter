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
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const selectAnchor = (rowIndex: number, columnIndex: number) => {
  const cellStore = useCellStore();
  const { startCellSelection } = cellStore;
  startCellSelection(rowIndex, columnIndex);
};

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

  describe("overwrite mode", () => {
    test("overwrites cells at selection anchor", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(
        createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]),
      );
      readTextMock.mockResolvedValueOnce("10\t20");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(dataSource);

      expect(takeOne(dataSource.rows).data.a).toBe("10");
      expect(takeOne(dataSource.rows).data.b).toBe("20");
    });

    test("overwrites only columns starting at column anchor", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(
        createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]),
      );
      readTextMock.mockResolvedValueOnce("99");
      selectAnchor(0, 1);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(dataSource);

      expect(takeOne(dataSource.rows).data.a).toBe("1");
      expect(takeOne(dataSource.rows).data.b).toBe("99");
    });

    test("appends new rows when pasted data extends past the last row", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("2\n3");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(dataSource);

      expect(dataSource.rows).toHaveLength(3);
      expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
      expect(takeOne(dataSource.rows, 2).data.a).toBe("3");
    });

    test("appends at end when no cell is selected", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("2");
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(dataSource);

      expect(dataSource.rows).toHaveLength(2);
      expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
    });

    test("coerces pasted values to target column type", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createNumberColumn("n")], [createRow({ n: 1 })]));
      readTextMock.mockResolvedValueOnce("42");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(dataSource);

      expect(takeOne(dataSource.rows).data.n).toBe(42);
    });

    test("undo restores original cell values", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "original" })]));
      readTextMock.mockResolvedValueOnce("changed");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const sheetHistoryStore = useSheetHistoryStore();
      sheetHistoryStore.undo(dataSource);

      assert.exists(dataSource);

      expect(takeOne(dataSource.rows).data.a).toBe("original");
    });

    test("undo removes appended rows", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("1\n2");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const sheetHistoryStore = useSheetHistoryStore();
      sheetHistoryStore.undo(dataSource);

      assert.exists(dataSource);

      expect(dataSource.rows).toHaveLength(1);
    });

    test("redo re-applies paste after undo", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "original" })]));
      readTextMock.mockResolvedValueOnce("changed");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const sheetHistoryStore = useSheetHistoryStore();
      sheetHistoryStore.undo(dataSource);
      sheetHistoryStore.redo(dataSource);

      assert.exists(dataSource);

      expect(takeOne(dataSource.rows).data.a).toBe("changed");
    });
  });

  describe("shift down mode", () => {
    test("inserts rows at anchor row position", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(
        createDataSource([createColumn("a")], [createRow({ a: "1" }), createRow({ a: "3" })]),
      );
      readTextMock.mockResolvedValueOnce("2");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard(PasteMode.ShiftDown);

      assert.exists(dataSource);

      expect(dataSource.rows).toHaveLength(3);
      expect(takeOne(dataSource.rows).data.a).toBe("1");
      expect(takeOne(dataSource.rows, 1).data.a).toBe("2");
      expect(takeOne(dataSource.rows, 2).data.a).toBe("3");
    });

    test("undo removes inserted rows and restores original order", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(
        createDataSource([createColumn("a")], [createRow({ a: "1" }), createRow({ a: "3" })]),
      );
      readTextMock.mockResolvedValueOnce("2");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard(PasteMode.ShiftDown);
      const sheetHistoryStore = useSheetHistoryStore();
      sheetHistoryStore.undo(dataSource);

      assert.exists(dataSource);

      expect(dataSource.rows).toHaveLength(2);
      expect(takeOne(dataSource.rows).data.a).toBe("1");
      expect(takeOne(dataSource.rows, 1).data.a).toBe("3");
    });
  });

  describe("no-op cases", () => {
    test("no-op when clipboard text is empty", async () => {
      expect.hasAssertions();

      const { dataSource } = setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const sheetHistoryStore = useSheetHistoryStore();

      assert.exists(dataSource);

      expect(sheetHistoryStore.isUndoable).toBe(false);
      expect(takeOne(dataSource.rows).data.a).toBe("1");
    });
  });
});
