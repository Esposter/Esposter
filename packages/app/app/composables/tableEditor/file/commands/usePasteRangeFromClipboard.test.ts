// @vitest-environment nuxt
import {
  makeColumn,
  makeDataSource,
  makeNumberColumn,
  makeRow,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { usePasteRangeFromClipboard } from "@/composables/tableEditor/file/commands/usePasteRangeFromClipboard";
import { PasteMode } from "@/models/tableEditor/file/commands/PasteMode";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const selectAnchor = (rowIndex: number, columnIndex: number) => {
  const { startCellSelection } = useCellStore();
  startCellSelection(rowIndex, columnIndex);
};

describe(usePasteRangeFromClipboard, () => {
  let readTextMock: ReturnType<typeof vi.fn<() => Promise<string>>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    readTextMock = vi.fn<() => Promise<string>>().mockResolvedValue("");
    vi.stubGlobal("navigator", { clipboard: { readText: readTextMock } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    const fileHistoryStore = useFileHistoryStore();
    fileHistoryStore.clear();
  });

  describe("overwrite mode", () => {
    test("overwrites cells at selection anchor", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(
        makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "1", b: "2" })]),
      );
      readTextMock.mockResolvedValueOnce("10\t20");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(editedItem.value?.dataSource);

      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("10");
      expect(takeOne(editedItem.value.dataSource.rows).data.b).toBe("20");
    });

    test("overwrites only columns starting at column anchor", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(
        makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "1", b: "2" })]),
      );
      readTextMock.mockResolvedValueOnce("99");
      selectAnchor(0, 1);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(editedItem.value?.dataSource);

      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("1");
      expect(takeOne(editedItem.value.dataSource.rows).data.b).toBe("99");
    });

    test("appends new rows when pasted data extends past the last row", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("2\n3");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(editedItem.value?.dataSource);

      expect(editedItem.value.dataSource.rows).toHaveLength(3);
      expect(takeOne(editedItem.value.dataSource.rows, 1).data.a).toBe("2");
      expect(takeOne(editedItem.value.dataSource.rows, 2).data.a).toBe("3");
    });

    test("appends at end when no cell is selected", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("2");
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(editedItem.value?.dataSource);

      expect(editedItem.value.dataSource.rows).toHaveLength(2);
      expect(takeOne(editedItem.value.dataSource.rows, 1).data.a).toBe("2");
    });

    test("coerces pasted values to target column type", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeNumberColumn("n")], [makeRow({ n: 1 })]));
      readTextMock.mockResolvedValueOnce("42");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      assert.exists(editedItem.value?.dataSource);

      expect(takeOne(editedItem.value.dataSource.rows).data.n).toBe(42);
    });

    test("undo restores original cell values", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "original" })]));
      readTextMock.mockResolvedValueOnce("changed");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const fileHistoryStore = useFileHistoryStore();
      fileHistoryStore.undo(editedItem.value);

      assert.exists(editedItem.value?.dataSource);

      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("original");
    });

    test("undo removes appended rows", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("1\n2");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const fileHistoryStore = useFileHistoryStore();
      fileHistoryStore.undo(editedItem.value);

      assert.exists(editedItem.value?.dataSource);

      expect(editedItem.value.dataSource.rows).toHaveLength(1);
    });

    test("redo re-applies paste after undo", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "original" })]));
      readTextMock.mockResolvedValueOnce("changed");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const fileHistoryStore = useFileHistoryStore();
      fileHistoryStore.undo(editedItem.value);
      fileHistoryStore.redo(editedItem.value);

      assert.exists(editedItem.value?.dataSource);

      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("changed");
    });
  });

  describe("shift down mode", () => {
    test("inserts rows at anchor row position", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(
        makeDataSource([makeColumn("a")], [makeRow({ a: "1" }), makeRow({ a: "3" })]),
      );
      readTextMock.mockResolvedValueOnce("2");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard(PasteMode.ShiftDown);

      assert.exists(editedItem.value?.dataSource);

      expect(editedItem.value.dataSource.rows).toHaveLength(3);
      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("1");
      expect(takeOne(editedItem.value.dataSource.rows, 1).data.a).toBe("2");
      expect(takeOne(editedItem.value.dataSource.rows, 2).data.a).toBe("3");
    });

    test("undo removes inserted rows and restores original order", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(
        makeDataSource([makeColumn("a")], [makeRow({ a: "1" }), makeRow({ a: "3" })]),
      );
      readTextMock.mockResolvedValueOnce("2");
      selectAnchor(1, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard(PasteMode.ShiftDown);
      const fileHistoryStore = useFileHistoryStore();
      fileHistoryStore.undo(editedItem.value);

      assert.exists(editedItem.value?.dataSource);

      expect(editedItem.value.dataSource.rows).toHaveLength(2);
      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("1");
      expect(takeOne(editedItem.value.dataSource.rows, 1).data.a).toBe("3");
    });
  });

  describe("no-op cases", () => {
    test("no-op when clipboard text is empty", async () => {
      expect.hasAssertions();

      const { editedItem } = setupWithDataSource(makeDataSource([makeColumn("a")], [makeRow({ a: "1" })]));
      readTextMock.mockResolvedValueOnce("");
      selectAnchor(0, 0);
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();
      const fileHistoryStore = useFileHistoryStore();

      assert.exists(editedItem.value?.dataSource);

      expect(fileHistoryStore.isUndoable).toBe(false);
      expect(takeOne(editedItem.value.dataSource.rows).data.a).toBe("1");
    });

    test("no-op when dataSource is null", async () => {
      expect.hasAssertions();

      readTextMock.mockResolvedValueOnce("10");
      const pasteRangeFromClipboard = usePasteRangeFromClipboard();
      await pasteRangeFromClipboard();

      expect(readTextMock).not.toHaveBeenCalled();
    });
  });
});
