import { createColumn, createDataSource, createRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { serializeToTsv } from "@/services/tableEditor/file/commands/serializeToTsv";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardRows, () => {
  test("maps matching columns to correct values", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")]);
    const rows = parseClipboardRows("a\tb\n0\t1", dataSource);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows).data.a).toBe("0");
    expect(takeOne(rows).data.b).toBe("1");
  });

  test("initializes unmatched columns to null", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a"), createColumn("b")]);
    const rows = parseClipboardRows("a\n0", dataSource);

    expect(takeOne(rows).data.b).toBeNull();
  });

  test("ignores extra columns not in dataSource", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);
    const rows = parseClipboardRows("a\textra\n0\tignored", dataSource);

    expect(Object.keys(takeOne(rows).data)).toStrictEqual(["a"]);
  });

  test("matching is case-sensitive", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);
    const rows = parseClipboardRows("A\n0", dataSource);

    expect(takeOne(rows).data.a).toBeNull();
  });

  test("returns empty array when no data rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("a")]);
    const rows = parseClipboardRows("a", dataSource);

    expect(rows).toHaveLength(0);
  });

  describe("roundtrip with serializeToTsv", () => {
    test("preserves basic string values", () => {
      expect.hasAssertions();

      const dataSource = createDataSource([createColumn("a"), createColumn("b")], [createRow({ a: "0", b: "1" })]);
      const rows = parseClipboardRows(serializeToTsv(dataSource), dataSource);

      expect(takeOne(rows).data.a).toBe("0");
      expect(takeOne(rows).data.b).toBe("1");
    });

    test("preserves column names with leading and trailing whitespace", () => {
      expect.hasAssertions();

      const dataSource = createDataSource([createColumn(" a ")], [createRow({ " a ": "0" })]);
      const rows = parseClipboardRows(serializeToTsv(dataSource), dataSource);

      expect(takeOne(rows).data[" a "]).toBe("0");
    });
  });
});
