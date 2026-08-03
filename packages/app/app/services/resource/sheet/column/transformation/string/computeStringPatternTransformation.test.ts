import { computeStringPatternTransformation } from "@/services/resource/sheet/column/transformation/string/computeStringPatternTransformation";
import { describe, expect, test } from "vitest";

// The variable substitution matrix lives in decompileVariables.test.ts; here only the positional index mapping of the source values
describe(computeStringPatternTransformation, () => {
  test("maps each value to its positional index", () => {
    expect.hasAssertions();
    expect(computeStringPatternTransformation(["a", "b"], "{0}{1}")).toBe("ab");
    expect(computeStringPatternTransformation(["a", "b"], "{1}{0}")).toBe("ba");
  });

  test("renders a null value as an empty string", () => {
    expect.hasAssertions();
    expect(computeStringPatternTransformation([null, "a"], "{0}{1}")).toBe("a");
  });

  test("renders an index with no value as an empty string", () => {
    expect.hasAssertions();
    expect(computeStringPatternTransformation(["a"], "{0}{1}")).toBe("a");
  });

  test("leaves a pattern without variables unchanged", () => {
    expect.hasAssertions();
    expect(computeStringPatternTransformation(["a"], " ")).toBe(" ");
  });
});
