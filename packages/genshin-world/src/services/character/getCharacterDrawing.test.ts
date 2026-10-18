import { CharacterDrawing } from "#src/models/character/CharacterDrawing";
import { getCharacterDrawing } from "#src/services/character/getCharacterDrawing";
import { describe, expect, test } from "vitest";

describe(getCharacterDrawing, () => {
  test("a reader without the official model sees no character", () => {
    expect.hasAssertions();

    expect(getCharacterDrawing({ hasReader: true, isFailed: true, isLoaded: false })).toBe(CharacterDrawing.None);
  });

  test("a character with no reader is not drawn", () => {
    expect.hasAssertions();

    expect(getCharacterDrawing({ hasReader: false, isFailed: false, isLoaded: false })).toBe(CharacterDrawing.None);
  });

  test("the capsule shows only while a model is loading, and the loaded model takes its place", () => {
    expect.hasAssertions();

    expect(getCharacterDrawing({ hasReader: true, isFailed: false, isLoaded: false })).toBe(CharacterDrawing.Capsule);
    expect(getCharacterDrawing({ hasReader: true, isFailed: false, isLoaded: true })).toBe(CharacterDrawing.Model);
  });
});
