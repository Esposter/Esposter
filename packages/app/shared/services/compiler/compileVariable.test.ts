// @vitest-environment node
import { Delimiter } from "#shared/models/compiler/Delimiter";
import { compileVariable } from "#shared/services/compiler/compileVariable";
import { describe, expect, test } from "vitest";

describe(compileVariable, () => {
  test("wraps key with curly brace delimiters by default", () => {
    expect.hasAssertions();
    expect(compileVariable("0")).toBe("{0}");
  });

  test("wraps a second key with curly brace delimiters by default", () => {
    expect.hasAssertions();
    expect(compileVariable("1")).toBe("{1}");
  });

  test("wraps key with explicit curly brace delimiter", () => {
    expect.hasAssertions();
    expect(compileVariable("0", Delimiter.CurlyBraces)).toBe("{0}");
  });
});
