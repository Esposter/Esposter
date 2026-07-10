// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useCopyRangeToClipboard } from "@/composables/resource/file/useCopyRangeToClipboard";
import { useCellStore } from "@/store/resource/file/cell";
import { useRowStore } from "@/store/resource/file/row";
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
      createDataSource(
        [createColumn("a"), createColumn("b")],
        [createRow({ a: "1", b: "2" }), createRow({ a: "3", b: "4" })],
      ),
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
});
