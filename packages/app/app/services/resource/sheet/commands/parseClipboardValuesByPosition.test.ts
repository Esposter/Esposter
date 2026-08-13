import { parseClipboardValuesByPosition } from "@/services/resource/sheet/commands/parseClipboardValuesByPosition";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseClipboardValuesByPosition, () => {
  test("splits tab-separated values into columns", () => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition("a")).toStrictEqual([["a"]]);
    expect(parseClipboardValuesByPosition("a\tb\tc")).toStrictEqual([["a", "b", "c"]]);
  });

  test.each(["a\tb\n1\t2", "a\tb\r\n1\t2"])("parses multiple rows out of %j", (text) => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition(text)).toStrictEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
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
