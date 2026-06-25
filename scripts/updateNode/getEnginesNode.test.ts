import { getEnginesNode } from "@/updateNode/getEnginesNode";
import { describe, expect, test } from "vitest";

describe(getEnginesNode, () => {
  test("reads engines.node and strips the caret", () => {
    expect.hasAssertions();

    expect(getEnginesNode('{ "engines": { "node": "^1.0.0" } }')).toBe("1.0.0");
  });

  test("reads an exact version with no caret", () => {
    expect.hasAssertions();

    expect(getEnginesNode('{ "engines": { "node": "1.0.0" } }')).toBe("1.0.0");
  });

  test("matches across newlines and indentation", () => {
    expect.hasAssertions();

    expect(getEnginesNode('{\n  "engines": {\n    "node": "^1.0.0"\n  }\n}')).toBe("1.0.0");
  });

  test("throws when engines.node is absent", () => {
    expect.hasAssertions();

    expect(() => getEnginesNode("{}")).toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not find engines.node in package.json]`,
    );
  });
});
