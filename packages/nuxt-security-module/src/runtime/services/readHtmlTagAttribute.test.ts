import { readHtmlTagAttribute } from "#src/runtime/services/readHtmlTagAttribute";
import { describe, expect, test } from "vitest";

describe(readHtmlTagAttribute, () => {
  const ATTRIBUTES = ' SRC="/a.js" rel=stylesheet data-quote=\'it"s\'';

  test("an attribute is read by its name without regard to case, and its quotes are removed", () => {
    expect.hasAssertions();

    expect(readHtmlTagAttribute(ATTRIBUTES, "src")).toBe("/a.js");
    expect(readHtmlTagAttribute(ATTRIBUTES, "rel")).toBe("stylesheet");
  });

  test("an attribute that is absent reads as undefined", () => {
    expect.hasAssertions();

    expect(readHtmlTagAttribute(ATTRIBUTES, "integrity")).toBeUndefined();
  });
});
