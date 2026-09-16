import { getControlCharacters } from "#src/services/sweeps/controlCharacters/getControlCharacters";
import { describe, expect, test } from "vitest";

describe(getControlCharacters, () => {
  // The whole reason this scan exists: a scan that reports nothing reads exactly like a clean tree, so the first
  // Thing it owes is a planted violation it does report. The escape below is six ordinary source characters —
  // What it evaluates to is the byte this file may never itself hold
  test("reports a record separator written as the character rather than as its escape", () => {
    expect.hasAssertions();

    expect(getControlCharacters(`const RECORD_SEPARATOR = "\u001E";`)).toStrictEqual([{ codePoint: 0x1e, line: 1 }]);
  });

  test("reports DEL, which sits above the C0 block and renders as nothing all the same", () => {
    expect.hasAssertions();

    expect(getControlCharacters("\u007F")).toStrictEqual([{ codePoint: 0x7f, line: 1 }]);
  });

  // The three a text file is written with, and the only reason the scan is not simply "no character below space"
  test("skips tab, newline and carriage return", () => {
    expect.hasAssertions();

    expect(getControlCharacters("\t\n\r")).toStrictEqual([]);
  });

  test("counts the line from the newlines before the character", () => {
    expect.hasAssertions();

    expect(getControlCharacters("\n\n\u001F")).toStrictEqual([{ codePoint: 0x1f, line: 3 }]);
  });
});
