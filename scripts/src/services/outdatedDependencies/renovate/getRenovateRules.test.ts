import { getRenovateRules } from "#src/services/outdatedDependencies/renovate/getRenovateRules";
import { describe, expect, test } from "vitest";

describe(getRenovateRules, () => {
  test("keeps only the rules that name packages", () => {
    expect.hasAssertions();

    const rules = getRenovateRules(
      JSON.stringify({
        packageRules: [{ matchUpdateTypes: ["minor"] }, { enabled: false, matchPackageNames: ["a"] }],
      }),
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
});
