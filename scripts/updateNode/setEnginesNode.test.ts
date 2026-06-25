import { setEnginesNode } from "@/updateNode/setEnginesNode";
import { describe, expect, test } from "vitest";

describe(setEnginesNode, () => {
  test("rewrites engines.node to the carated version", () => {
    expect.hasAssertions();

    expect(setEnginesNode('{ "engines": { "node": "^0.0.0" } }', "1.0.0")).toBe('{ "engines": { "node": "^1.0.0" } }');
  });

  test("preserves surrounding formatting", () => {
    expect.hasAssertions();

    expect(setEnginesNode('{\n  "engines": {\n    "node": "^0.0.0"\n  }\n}', "1.0.0")).toBe(
      '{\n  "engines": {\n    "node": "^1.0.0"\n  }\n}',
    );
  });

  test("throws when engines.node is absent", () => {
    expect.hasAssertions();

    expect(() => setEnginesNode("{}", "1.0.0")).toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not find engines.node in package.json]`,
    );
  });
});
