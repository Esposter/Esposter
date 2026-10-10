import { findCharacterPackModel } from "#src/services/genshinCharacters/findCharacterPackModel";
import { describe, expect, test } from "vitest";

describe(findCharacterPackModel, () => {
  test("finds the one model in any case", () => {
    expect.hasAssertions();
    expect(findCharacterPackModel("", ["", "a.PMX"])).toBe("a.PMX");
  });

  test("refuses a folder of several models, naming each", () => {
    expect.hasAssertions();
    expect(() => findCharacterPackModel("", ["a.pmx", "b.pmx"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , holds several .pmx models: a.pmx, b.pmx]`,
    );
  });
});
