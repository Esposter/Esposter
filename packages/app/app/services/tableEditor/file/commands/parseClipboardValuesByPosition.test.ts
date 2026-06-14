import { parseClipboardValuesByPosition } from "@/services/tableEditor/file/commands/parseClipboardValuesByPosition";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardValuesByPosition, () => {
  test("parses single row with single value", () => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition("a")).toStrictEqual([["a"]]);
  });

  test("splits tab-separated values into columns", () => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition("a\tb\tc")).toStrictEqual([["a", "b", "c"]]);
  });

  test("parses multiple rows", () => {
    expect.hasAssertions();

    const result = parseClipboardValuesByPosition("a\tb\n1\t2");

    expect(result).toHaveLength(2);
    expect(takeOne(result)).toStrictEqual(["a", "b"]);
    expect(takeOne(result, 1)).toStrictEqual(["1", "2"]);
  });

  test("handles CRLF line endings", () => {
    expect.hasAssertions();

    const result = parseClipboardValuesByPosition("a\tb\r\n1\t2");

    expect(result).toHaveLength(2);
    expect(takeOne(result)).toStrictEqual(["a", "b"]);
    expect(takeOne(result, 1)).toStrictEqual(["1", "2"]);
  });

  test("filters whitespace-only lines", () => {
    expect.hasAssertions();

    const result = parseClipboardValuesByPosition("a\n   \nb");

    expect(result).toHaveLength(2);
    expect(takeOne(result)).toStrictEqual(["a"]);
    expect(takeOne(result, 1)).toStrictEqual(["b"]);
  });

  test("returns empty array for empty string", () => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition("")).toStrictEqual([]);
  });

  test("preserves whitespace within values", () => {
    expect.hasAssertions();

    const result = parseClipboardValuesByPosition("  a  \t b  ");

    expect(takeOne(takeOne(result))).toBe("  a  ");
    expect(takeOne(takeOne(result), 1)).toBe(" b  ");
  });
});
