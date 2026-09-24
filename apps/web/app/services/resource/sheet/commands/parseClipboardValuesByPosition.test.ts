import { parseClipboardValuesByPosition } from "@/services/resource/sheet/commands/parseClipboardValuesByPosition";
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

    expect(parseClipboardValuesByPosition("a\n \nb")).toStrictEqual([["a"], ["b"]]);
  });

  test("returns empty array for empty string", () => {
    expect.hasAssertions();
    expect(parseClipboardValuesByPosition("")).toStrictEqual([]);
  });

  test("preserves whitespace within values", () => {
    expect.hasAssertions();

    expect(parseClipboardValuesByPosition(" a\tb ")).toStrictEqual([[" a", "b "]]);
  });
});
