import { Attribute } from "#src/models/character/Attribute";
import { getAttributeLabel } from "#src/services/character/getAttributeLabel";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(getAttributeLabel, () => {
  // An attribute no caption is mapped to is absent, not refused: a weapon's secondary the map names nothing for leaves its
  // Caption undrawn
  test("an attribute the map names no caption for is captioned empty", () => {
    expect.hasAssertions();

    expect(getAttributeLabel(Attribute.MovementSpeed, ENGLISH_GAME_TEXT)).toBe("");
  });

  test("an absent attribute is captioned empty", () => {
    expect.hasAssertions();

    expect(getAttributeLabel(undefined, ENGLISH_GAME_TEXT)).toBe("");
  });
});
