import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

describe("errorHandling", () => {
  const RULE = "error-handling/no-bare-error";
  const FIXTURES = [
    { name: "throwsBareError", source: `export const a = () => { throw new Error(""); };`, violations: 1 },
    { name: "rejectsWithBareError", source: `export const a = Promise.reject(new Error(""));`, violations: 1 },
    {
      name: "throwsInvalidOperationError",
      source: `export const a = () => { throw new InvalidOperationError(); };`,
      violations: 0,
    },
    // A subclass is named for what it is; only the bare constructor says nothing.
    { name: "throwsErrorSubclass", source: `export const a = () => { throw new TypeError(""); };`, violations: 0 },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "errorHandling",
    rules: [RULE],
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())]).toStrictEqual(["error-handling(no-bare-error)"]);
  });
});
