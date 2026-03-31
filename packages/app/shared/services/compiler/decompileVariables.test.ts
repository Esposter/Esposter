// @vitest-environment node
import { decompileVariables } from "#shared/services/compiler/decompileVariables";
import { describe, expect, test } from "vitest";

describe(decompileVariables, () => {
  test("substitutes a single variable", () => {
    expect.hasAssertions();
    expect(decompileVariables("{0}", { "0": "" })).toBe("");
  });

  test("substitutes a variable with a non-empty value", () => {
    expect.hasAssertions();
    expect(decompileVariables("{0}", { "0": " " })).toBe(" ");
  });

  test("substitutes multiple variables", () => {
    expect.hasAssertions();
    expect(decompileVariables("{0} {1}", { "0": "", "1": " " })).toBe("  ");
  });

  test("returns empty string for a missing key", () => {
    expect.hasAssertions();
    expect(decompileVariables("{0}", {})).toBe("");
  });

  test("leaves strings without variables unchanged", () => {
    expect.hasAssertions();
    expect(decompileVariables("", {})).toBe("");
  });

  test("substitutes a repeated variable consistently", () => {
    expect.hasAssertions();
    expect(decompileVariables("{0} {0}", { "0": " " })).toBe("  ");
  });
});
