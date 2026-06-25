import { setCatalogTypesNode } from "@/updateNode/setCatalogTypesNode";
import { describe, expect, test } from "vitest";

describe(setCatalogTypesNode, () => {
  test("rewrites the @types/node catalog entry to the carated version", () => {
    expect.hasAssertions();

    expect(setCatalogTypesNode('  "@types/node": ^0.0.0', "1.0.0")).toBe('  "@types/node": ^1.0.0');
  });

  test("only touches the @types/node line", () => {
    expect.hasAssertions();

    expect(setCatalogTypesNode('  "a": ^0.0.0\n  "@types/node": ^0.0.0', "1.0.0")).toBe(
      '  "a": ^0.0.0\n  "@types/node": ^1.0.0',
    );
  });

  test("throws when @types/node is absent", () => {
    expect.hasAssertions();

    expect(() => setCatalogTypesNode("catalog:", "1.0.0")).toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not find @types/node in pnpm-workspace.yaml]`,
    );
  });
});
