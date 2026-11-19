import { createBlinkMorphAttribute } from "#src/character/face/createBlinkMorphAttribute";
import { describe, expect, test } from "vitest";

describe(createBlinkMorphAttribute, () => {
  test("a pack with no morphs keeps a still face", () => {
    expect.hasAssertions();

    expect(createBlinkMorphAttribute([], 0)).toBeUndefined();
  });
});
