import { stripPrefix } from "#src/stripPrefix";
import { describe, expect, test } from "vitest";

describe(stripPrefix, () => {
  test("strips a namespace prefix but keeps xmlns", () => {
    expect.hasAssertions();

    expect(stripPrefix("ns:tag")).toBe("tag");
    expect(stripPrefix("tag")).toBe("tag");
    expect(stripPrefix("xmlns:ns")).toBe("xmlns:ns");
  });
});
