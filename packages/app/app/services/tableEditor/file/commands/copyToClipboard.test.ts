// @vitest-environment nuxt
import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(copyToClipboard, () => {
  let writtenText = "";

  beforeAll(() => {
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

  beforeEach(() => {
    writtenText = "";
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("copies all rows when no rowIds passed", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    await copyToClipboard(dataSource);
    const lines = writtenText.split("\n");

    expect(takeOne(lines)).toBe("a\tb");
    expect(takeOne(lines, 1)).toBe("0\t1");
  });

  test("copies empty rows when rowIds is empty array", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "0" })]);
    await copyToClipboard(dataSource, { rowIds: [] });
    const lines = writtenText.split("\n");

    expect(lines).toHaveLength(1);
    expect(takeOne(lines)).toBe("a");
  });

  test("copies only selected rows when rowIds passed", async () => {
    expect.hasAssertions();

    const row = makeRow({ a: "0" });
    const dataSource = makeDataSource([makeColumn("a")], [row, makeRow({ a: "1" })]);
    await copyToClipboard(dataSource, { rowIds: [row.id] });
    const lines = writtenText.split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines, 1)).toBe("0");
  });

  test("omits header row when includeHeaders is false", async () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "42" })]);
    await copyToClipboard(dataSource, { includeHeaders: false });
    const lines = writtenText.split("\n");

    expect(lines).toHaveLength(1);
    expect(takeOne(lines)).toBe("42");
  });

  describe("clipboardItem branch", () => {
    let writeMock: ReturnType<typeof vi.fn<() => Promise<void>>>;
    const capturedItems: { "text/html": Blob; "text/plain": Blob }[] = [];

    beforeEach(() => {
      capturedItems.length = 0;
      writeMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
      vi.stubGlobal(
        "ClipboardItem",
        class {
          constructor(items: { "text/html": Blob; "text/plain": Blob }) {
            capturedItems.push(items);
          }
        },
      );
      vi.stubGlobal("navigator", { clipboard: { write: writeMock } });
    });

    afterEach(() => {
      vi.stubGlobal("ClipboardItem", undefined);
      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: (text: string) => {
            writtenText = text;
          },
        },
      });
    });

    test("omits header row from HTML and TSV when includeHeaders is false", async () => {
      expect.hasAssertions();

      const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "42" })]);
      await copyToClipboard(dataSource, { includeHeaders: false });
      const items = takeOne(capturedItems);
      assert.exists(items);
      const { "text/html": htmlBlob, "text/plain": tsvBlob } = items;
      const htmlText = await htmlBlob.text();
      const tsvText = await tsvBlob.text();

      expect(htmlText).not.toContain("<th>");
      expect(htmlText).toContain("<td>42</td>");
      expect(tsvText).toBe("42");
    });
  });
});
