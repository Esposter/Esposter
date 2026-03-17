import { makeColumn, makeDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardRows, () => {
  test("maps matching columns to correct values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = parseClipboardRows("| a | b |\n| --- | --- |\n| 0 | 1 |", dataSource);

    expect(rows).toHaveLength(1);
    expect(takeOne(rows, 0).data.a).toBe("0");
    expect(takeOne(rows, 0).data.b).toBe("1");
  });

  test("initializes unmatched columns to null", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")]);
    const rows = parseClipboardRows("| a |\n| --- |\n| 0 |", dataSource);

    expect(takeOne(rows, 0).data.b).toBeNull();
  });

  test("ignores extra columns not in dataSource", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| a | extra |\n| --- | --- |\n| 0 | ignored |", dataSource);

    expect(Object.keys(takeOne(rows, 0).data)).toStrictEqual(["a"]);
  });

  test("matching is case-sensitive", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| A |\n| --- |\n| 0 |", dataSource);

    expect(takeOne(rows, 0).data.a).toBeNull();
  });

  test("returns empty array when no data rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const rows = parseClipboardRows("| a |\n| --- |", dataSource);

    expect(rows).toHaveLength(0);
  });
});
