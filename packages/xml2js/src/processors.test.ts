import { processors } from "#src/processors";
import { describe, expect, test } from "vitest";

describe("processors", () => {
  test("parseNumbers parses numeric strings and passes the rest through", () => {
    expect.hasAssertions();

    expect(processors.parseNumbers("1")).toBe(1);
    expect(processors.parseNumbers("-1")).toBe(-1);
    expect(processors.parseNumbers("0.1")).toBe(0.1);
    expect(processors.parseNumbers("1e1")).toBe(10);
    expect(processors.parseNumbers("a")).toBe("a");
  });

  // Issue #700: an empty value was read as zero, which changed data that only had to be left alone
  test("parseNumbers leaves an empty or blank string unchanged", () => {
    expect.hasAssertions();

    expect(processors.parseNumbers("")).toBe("");
    expect(processors.parseNumbers(" ")).toBe(" ");
  });

  test("parseBooleans parses boolean strings case-insensitively and passes the rest through", () => {
    expect.hasAssertions();

    expect(processors.parseBooleans("true")).toBe(true);
    expect(processors.parseBooleans("TRUE")).toBe(true);
    expect(processors.parseBooleans("false")).toBe(false);
    expect(processors.parseBooleans("")).toBe("");
  });

  test("stripPrefix strips a namespace prefix but keeps xmlns", () => {
    expect.hasAssertions();

    expect(processors.stripPrefix("a:b")).toBe("b");
    expect(processors.stripPrefix("a")).toBe("a");
    expect(processors.stripPrefix("xmlns:a")).toBe("xmlns:a");
    // Only the reserved prefix is spared: this one merely starts with the same letters
    expect(processors.stripPrefix("xmlnsa:b")).toBe("b");
  });

  test("normalize lowercases and firstCharLowerCase lowercases only the first character", () => {
    expect.hasAssertions();

    expect(processors.normalize("AbC")).toBe("abc");
    expect(processors.firstCharLowerCase("AbC")).toBe("abC");
  });
});
