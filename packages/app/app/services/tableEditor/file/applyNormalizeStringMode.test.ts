import { NormalizeStringMode } from "@/models/tableEditor/file/NormalizeStringMode";
import { applyNormalizeStringMode } from "@/services/tableEditor/file/applyNormalizeStringMode";
import { describe, expect, test } from "vitest";

describe(applyNormalizeStringMode, () => {
  test(`${NormalizeStringMode.Trim} removes surrounding whitespace`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode(" ", NormalizeStringMode.Trim)).toBe("");
  });

  test(`${NormalizeStringMode.Trim} is a no-op when already trimmed`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode("", NormalizeStringMode.Trim)).toBe("");
  });

  test(`${NormalizeStringMode.Lowercase} lowercases all characters`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode("A", NormalizeStringMode.Lowercase)).toBe("a");
  });

  test(`${NormalizeStringMode.Uppercase} uppercases all characters`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode("a", NormalizeStringMode.Uppercase)).toBe("A");
  });

  test(`${NormalizeStringMode.TitleCase} capitalizes the first letter of each word`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode("hello world", NormalizeStringMode.TitleCase)).toBe("Hello World");
  });

  test(`${NormalizeStringMode.TitleCase} handles empty string`, () => {
    expect.hasAssertions();
    expect(applyNormalizeStringMode("", NormalizeStringMode.TitleCase)).toBe("");
  });
});
