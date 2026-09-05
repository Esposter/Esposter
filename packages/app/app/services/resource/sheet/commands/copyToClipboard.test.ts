// @vitest-environment happy-dom
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { copyToClipboard } from "@/services/resource/sheet/commands/copyToClipboard";
import { takeOne } from "@esposter/shared";
import { afterAll, assert, beforeEach, describe, expect, test, vi } from "vitest";

describe(copyToClipboard, () => {
  let writtenText = "";
  // The rich-clipboard path a browser that has `ClipboardItem` takes: installed by the one test that drives it,
  // Because the default stubs below are what every other case reads
  const stubClipboardItem = () => {
    const capturedItems: { "text/html": Blob; "text/plain": Blob }[] = [];
    vi.stubGlobal(
      "ClipboardItem",
      class {
        items: { "text/html": Blob; "text/plain": Blob };

        constructor(items: { "text/html": Blob; "text/plain": Blob }) {
          this.items = items;
          capturedItems.push(items);
        }
      },
    );
    vi.stubGlobal("navigator", { clipboard: { write: vi.fn<() => Promise<void>>().mockResolvedValue(undefined) } });
    return capturedItems;
  };

  beforeEach(() => {
    writtenText = "";
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("ClipboardItem", undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: (text: string) => {
          writtenText = text;
        },
      },
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("copies all rows when no rowIds passed", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "0", b: "1" })]);
    await copyToClipboard(dataSource);
    const lines = writtenText.split("\n");

    expect(takeOne(lines, 1)).toBe("0\t1");
  });

  test("copies empty rows when rowIds is empty array", async () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "0" })]);
    await copyToClipboard(dataSource, { rowIds: [] });
    const lines = writtenText.split("\n");

    expect(lines).toHaveLength(1);
    expect(takeOne(lines)).toBe("a");
  });

  test("copies only selected rows when rowIds passed", async () => {
    expect.hasAssertions();

    const row = createRow({ a: "0" });
    const dataSource = createDataSource([createColumn("a")], [row, createRow({ a: "1" })]);
    await copyToClipboard(dataSource, { rowIds: [row.id] });
    const lines = writtenText.split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines, 1)).toBe("0");
  });

  test("omits header row from HTML and TSV when includeHeaders is false", async () => {
    expect.hasAssertions();

    const capturedItems = stubClipboardItem();
    const dataSource = createDataSource([createColumn("a")], [createRow({ a: "42" })]);
    await copyToClipboard(dataSource, { includeHeaders: false });
    const items = takeOne(capturedItems);
    assert.exists(items);
    const { "text/html": htmlBlob, "text/plain": tsvBlob } = items;
    const htmlText = await htmlBlob.text();
    const tsvText = await tsvBlob.text();

    expect(htmlText).toMatchInlineSnapshot(`"<table><tr><td>42</td></tr></table>"`);
    expect(tsvText).toBe("42");
  });
});
