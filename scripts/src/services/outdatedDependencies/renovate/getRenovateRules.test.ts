import { getRenovateRules } from "#src/services/outdatedDependencies/renovate/getRenovateRules";
import { describe, expect, test } from "vitest";

describe(getRenovateRules, () => {
  test("keeps only the rules that name packages", () => {
    expect.hasAssertions();

    const rules = getRenovateRules(
      JSON.stringify({ packageRules: [{ matchUpdateTypes: ["minor"] }, { enabled: false, matchPackageNames: ["a"] }] }),
    );

    expect(rules).toStrictEqual([{ enabled: false, matchPackageNames: ["a"] }]);
  });

  test("rejects a glob or regex the report cannot match", () => {
    expect.hasAssertions();

    expect(() =>
      getRenovateRules(JSON.stringify({ packageRules: [{ matchPackageNames: ["@a/**"] }] })),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: renovate.json, matchPackageNames pattern @a/**]`,
    );
  });

  // The magic a pattern can carry without a star at all — one rule each, since a row of a table cannot hold the
  // Snapshot of a message naming its own pattern.
  test("rejects a brace list", () => {
    expect.hasAssertions();

    expect(() =>
      getRenovateRules(JSON.stringify({ packageRules: [{ matchPackageNames: ["{a,b}"] }] })),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: renovate.json, matchPackageNames pattern {a,b}]`,
    );
  });

  test("rejects a single-character wildcard", () => {
    expect.hasAssertions();

    expect(() =>
      getRenovateRules(JSON.stringify({ packageRules: [{ matchPackageNames: ["a?b"] }] })),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: renovate.json, matchPackageNames pattern a?b]`,
    );
  });
});
