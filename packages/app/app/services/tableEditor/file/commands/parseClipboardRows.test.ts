import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { serializeToMarkdown } from "@/services/tableEditor/file/commands/serializeToMarkdown";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardRows, () => {
  test("maps matching columns to correct values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = parseClipboardRows("| a | b |\n| --- | --- |\n| 0 | 1 |", dataSource);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows).data.a).toBe("0");
    expect(takeOne(rows).data.b).toBe("1");
  });

  test("initializes unmatched columns to null", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = parseClipboardRows("| a |\n| --- |\n| 0 |", dataSource);

    expect(takeOne(rows).data.b).toBeNull();
  });

  test("ignores extra columns not in dataSource", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| a | extra |\n| --- | --- |\n| 0 | ignored |", dataSource);

    expect(Object.keys(takeOne(rows).data)).toStrictEqual(["a"]);
  });

  test("matching is case-sensitive", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| A |\n| --- |\n| 0 |", dataSource);

    expect(takeOne(rows).data.a).toBeNull();
  });

  test("returns empty array when no data rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| a |\n| --- |", dataSource);

    expect(rows).toHaveLength(0);
  });

  test("matches column names with leading and trailing whitespace", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn(" a ")]);
    const rows = parseClipboardRows("|  a  |\n| --- |\n| 0 |", dataSource);

    expect(takeOne(rows).data[" a "]).toBe("0");
  });

  test("unescapes pipe characters in cell values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows(`| a |\n| --- |\n| x\\${ID_SEPARATOR}y |`, dataSource);

    expect(takeOne(rows).data.a).toBe(`x${ID_SEPARATOR}y`);
  });

  describe("roundtrip with serializeToMarkdown", () => {
    test("preserves basic string values", () => {
      expect.hasAssertions();

      const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
      const rows = parseClipboardRows(serializeToMarkdown(dataSource), dataSource);

      expect(takeOne(rows).data.a).toBe("0");
      expect(takeOne(rows).data.b).toBe("1");
    });

    test("preserves column names with leading and trailing whitespace", () => {
      expect.hasAssertions();

      const dataSource = makeDataSource([makeColumn(" a ")], [makeRow({ " a ": "0" })]);
      const rows = parseClipboardRows(serializeToMarkdown(dataSource), dataSource);

      expect(takeOne(rows).data[" a "]).toBe("0");
    });

    test("preserves pipe characters in cell values", () => {
      expect.hasAssertions();

      const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: `x${ID_SEPARATOR}y` })]);
      const rows = parseClipboardRows(serializeToMarkdown(dataSource), dataSource);

      expect(takeOne(rows).data.a).toBe(`x${ID_SEPARATOR}y`);
    });

    test("preserves pipe characters in column names", () => {
      expect.hasAssertions();

      const dataSource = makeDataSource([makeColumn(`a${ID_SEPARATOR}b`)], [makeRow({ [`a${ID_SEPARATOR}b`]: "0" })]);
      const rows = parseClipboardRows(serializeToMarkdown(dataSource), dataSource);

      expect(takeOne(rows).data[`a${ID_SEPARATOR}b`]).toBe("0");
    });
  });
});
