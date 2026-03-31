// @vitest-environment node
import { compileVariable } from "#shared/services/compiler/compileVariable";
import { describe, expect, test } from "vitest";

describe(compileVariable, () => {
  test("wraps key with curly brace delimiters by default", () => {
    expect.hasAssertions();
    expect(compileVariable("0")).toBe("{0}");
  });

  test("wraps empty key with curly brace delimiters by default", () => {
    expect.hasAssertions();
    expect(compileVariable("")).toBe("{}");
  });
});
