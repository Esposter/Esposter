// @vitest-environment nuxt
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useCopyRangeToClipboard } from "@/composables/tableEditor/file/useCopyRangeToClipboard";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useRowStore } from "@/store/tableEditor/file/row";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const selectRange = (rowStart: number, rowEnd: number, columnStart: number, columnEnd: number) => {
  const { extendCellSelection, startCellSelection } = useCellStore();
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

  test("writes selected range as TSV with headers", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = true;
    setupWithDataSource(
      makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "1", b: "2" }), makeRow({ a: "3", b: "4" })]),
    );
    selectRange(0, 0, 0, 1);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("a\tb\n1\t2");
  });

  test("writes selected range as TSV without headers when toggle is off", async () => {
    expect.hasAssertions();

    const rowStore = useRowStore();
    rowStore.copyIncludesHeaders = false;
    setupWithDataSource(makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "1", b: "2" })]));
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
      makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: "1", b: "2", c: "3" })]),
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
      makeDataSource([makeColumn("a")], [makeRow({ a: "1" }), makeRow({ a: "2" }), makeRow({ a: "3" })]),
    );
    selectRange(1, 2, 0, 0);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).toHaveBeenCalledWith("a\n2\n3");
  });

  test("no-op when no cell range is selected", async () => {
    expect.hasAssertions();

    setupWithDataSource();
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).not.toHaveBeenCalled();
  });

  test("no-op when dataSource is null", async () => {
    expect.hasAssertions();

    setupEditedItem();
    selectRange(0, 0, 0, 0);
    const copyRangeToClipboard = useCopyRangeToClipboard();
    await copyRangeToClipboard();

    expect(writeTextMock).not.toHaveBeenCalled();
  });
});
