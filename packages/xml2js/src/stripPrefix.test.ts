import { stripPrefix } from "#src/stripPrefix";
import { describe, expect, test } from "vitest";

describe(stripPrefix, () => {
  test("strips a namespace prefix but keeps xmlns", () => {
    expect.hasAssertions();

    expect(stripPrefix("ns:tag")).toBe("tag");
    expect(stripPrefix("tag")).toBe("tag");
    expect(stripPrefix("xmlns:ns")).toBe("xmlns:ns");
    // Only the reserved prefix is spared: this one merely starts with the same letters
    expect(stripPrefix("xmlnsfoo:tag")).toBe("tag");
  });
});
