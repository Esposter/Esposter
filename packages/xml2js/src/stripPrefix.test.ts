import { stripPrefix } from "#src/stripPrefix";
import { describe, expect, test } from "vitest";

describe(stripPrefix, () => {
  test("strips a namespace prefix but keeps xmlns", () => {
    expect.hasAssertions();

    expect(stripPrefix("a:b")).toBe("b");
    expect(stripPrefix("a")).toBe("a");
    expect(stripPrefix("xmlns:a")).toBe("xmlns:a");
    // Only the reserved prefix is spared: this one merely starts with the same letters
    expect(stripPrefix("xmlnsa:b")).toBe("b");
  });
});
