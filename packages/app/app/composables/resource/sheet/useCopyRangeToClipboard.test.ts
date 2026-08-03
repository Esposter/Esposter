// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useCopyRangeToClipboard } from "@/composables/resource/sheet/useCopyRangeToClipboard";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useRowStore } from "@/store/resource/sheet/row";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const selectRange = (rowStart: number, rowEnd: number, columnStart: number, columnEnd: number) => {
  const cellStore = useCellStore();
  const { extendCellSelection, startCellSelection } = cellStore;
  startCellSelection(rowStart, columnStart);
  extendCellSelection(rowEnd, columnEnd);
};

describe(useCopyRangeToClipboard, () => {
  let writeTextMock: ReturnType<typeof vi.fn<() => Promise<void>>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    writeTextMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    vi.stubGlobal("ClipboardItem", undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("writes selected range as TSV without headers when toggle is off", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = false;
    setupWithDataSource(createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "1", b: "2" })]));
    selectRange(0, 0, 0, 1);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("1\t2");
  });

  test("writes only columns within the selection range", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = true;
    setupWithDataSource(
      createDataSource(
        [createColumn("a"), createColumn("b"), createColumn("c")],
        [createRow({ a: "1", b: "2", c: "3" })],
      ),
    );
    selectRange(0, 0, 1, 1);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("b\n2");
  });

  test("writes only rows within the selection range", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = true;
    setupWithDataSource(
      createDataSource([createColumn("a")], [createRow({ a: "1" }), createRow({ a: "2" }), createRow({ a: "3" })]),
    );
    selectRange(1, 2, 0, 0);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("a\n2\n3");
  });

  test("materializes computed column values instead of empty cells", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = true;
    const sourceColumn = createNumberColumn("price");
    const computedColumn = createComputedColumn("priceStr", sourceColumn.id);
    setupWithDataSource(createDataSource([sourceColumn, computedColumn], [createRow({ price: 42 })]));
    selectRange(0, 0, 0, 1);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("price\tpriceStr\n42\t42");
  });

  // A range indexes the displayed columns, but computeValue resolves a computed column's source by id against
  // The columns it is handed — narrow that context to the displayed set and a hidden source is simply missing,
  // So the grid shows a value while the clipboard gets an empty cell
  test("materializes a computed column whose source column is hidden", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = true;
    const sourceColumn = createNumberColumn("price");
    sourceColumn.hidden = true;
    const computedColumn = createComputedColumn("priceStr", sourceColumn.id);
    setupWithDataSource(createDataSource([sourceColumn, computedColumn], [createRow({ price: 42 })]));
    selectRange(0, 0, 0, 0);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("priceStr\n42");
  });
});
