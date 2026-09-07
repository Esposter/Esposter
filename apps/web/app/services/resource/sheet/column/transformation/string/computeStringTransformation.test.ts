import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { computeStringTransformation } from "@/services/resource/sheet/column/transformation/string/computeStringTransformation";
import { describe, expect, test } from "vitest";

// The null guard and String(...) coercion of the source value live in ColumnTransformationComputeMap; here only the case/whitespace transforms
describe(computeStringTransformation, () => {
  test(`${StringTransformationType.LowerCase} lowercases every character`, () => {
    expect.hasAssertions();
    expect(computeStringTransformation("AA BB", StringTransformationType.LowerCase)).toBe("aa bb");
  });

  test(`${StringTransformationType.TitleCase} lowercases then capitalizes the first character of every word`, () => {
    expect.hasAssertions();
    expect(computeStringTransformation("AA BB", StringTransformationType.TitleCase)).toBe("Aa Bb");
  });

  test(`${StringTransformationType.Trim} removes leading and trailing whitespace`, () => {
    expect.hasAssertions();
    expect(computeStringTransformation(" ", StringTransformationType.Trim)).toBe("");
    expect(computeStringTransformation(" a a ", StringTransformationType.Trim)).toBe("a a");
  });

  test(`${StringTransformationType.UpperCase} uppercases every character`, () => {
    expect.hasAssertions();
    expect(computeStringTransformation("aa bb", StringTransformationType.UpperCase)).toBe("AA BB");
  });
});
