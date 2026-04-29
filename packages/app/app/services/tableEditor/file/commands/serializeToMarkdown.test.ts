import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";
import { serializeToMarkdown } from "@/services/tableEditor/file/commands/serializeToMarkdown";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(serializeToMarkdown, () => {
  test("produces header, separator, and data rows in markdown format", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a"), makeColumn("b")], [makeRow({ a: "0", b: "1" })]);
    const lines = serializeToMarkdown(dataSource).split("\n");

    expect(lines).toHaveLength(3);
    expect(takeOne(lines)).toBe("| a | b |");
    expect(takeOne(lines, 1)).toBe("| --- | --- |");
    expect(takeOne(lines, 2)).toBe("| 0 | 1 |");
  });

  test("produces only header and separator rows when no rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")]);
    const lines = serializeToMarkdown(dataSource).split("\n");

    expect(lines).toHaveLength(2);
    expect(takeOne(lines)).toBe("| a |");
    expect(takeOne(lines, 1)).toBe("| --- |");
  });

  test("escapes pipe characters in cell values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("a")], [makeRow({ a: `x${ID_SEPARATOR}y` })]);
    const lines = serializeToMarkdown(dataSource).split("\n");

    expect(takeOne(lines, 2)).toBe(`| x\\${ID_SEPARATOR}y |`);
  });

  test("escapes pipe characters in column names", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn(`a${ID_SEPARATOR}b`)], [makeRow({ [`a${ID_SEPARATOR}b`]: "0" })]);
    const lines = serializeToMarkdown(dataSource).split("\n");

    expect(takeOne(lines)).toBe(`| a\\${ID_SEPARATOR}b |`);
  });
});
