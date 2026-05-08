import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { serializeToTsv } from "@/services/tableEditor/file/commands/serializeToTsv";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(serializeToTsv, () => {
  test("produces header row followed by data rows in TSV format", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    const lines = serializeToTsv(dataSource).split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines)).toBe("a\tb");
    expect(takeOne(lines, 1)).toBe("0\t1");
  });

  test("produces only header row when no rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const lines = serializeToTsv(dataSource).split("\n");

    expect(lines).toHaveLength(1);
    expect(takeOne(lines)).toBe("a");
  });

  test("replaces tab characters in cell values with spaces", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: "x\ty" })]);
    const lines = serializeToTsv(dataSource).split("\n");

    expect(takeOne(lines, 1)).toBe("x y");
  });

  test("replaces tab characters in column names with spaces", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a\tb")], [makeRow({ "a\tb": "0" })]);
    const lines = serializeToTsv(dataSource).split("\n");

    expect(takeOne(lines)).toBe("a b");
  });
});
