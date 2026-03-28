import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";
import { applyStringTransformation } from "@/services/tableEditor/file/commands/applyStringTransformation";
import { describe, expect, test } from "vitest";

describe(applyStringTransformation, () => {
  test(`${StringTransformationType.Trim} removes surrounding whitespace`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation(" ", StringTransformationType.Trim)).toBe("");
  });

  test(`${StringTransformationType.Trim} is a no-op when already trimmed`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation("", StringTransformationType.Trim)).toBe("");
  });

  test(`${StringTransformationType.Lowercase} lowercases all characters`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation("A", StringTransformationType.Lowercase)).toBe("a");
  });

  test(`${StringTransformationType.Uppercase} uppercases all characters`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation("a", StringTransformationType.Uppercase)).toBe("A");
  });

  test(`${StringTransformationType.TitleCase} capitalizes the first letter of each word`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation("hello world", StringTransformationType.TitleCase)).toBe("Hello World");
  });

  test(`${StringTransformationType.TitleCase} handles empty string`, () => {
    expect.hasAssertions();
    expect(applyStringTransformation("", StringTransformationType.TitleCase)).toBe("");
  });
});
