import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ElementColorMap } from "#src/services/constants";
import { getPersonaCharacter } from "#src/services/getPersonaCharacter";
import { assert, describe, expect, test } from "vitest";

describe(getPersonaCharacter, () => {
  // The display name is what is drawn and the English name is only the identity, so they differ here
  const displayName = "displayName";
  const name = "name";

  test("takes the character's own colour ahead of the element's", () => {
    expect.hasAssertions();

    const characterName = "Jean";
    const color = CharacterColorMap[characterName];
    assert.exists(color);

    expect(getPersonaCharacter({ displayName, element: "Anemo", name: characterName })).toStrictEqual({
      color,
      displayName,
      name: characterName,
    });
  });

  test("lightens a colour too dark to read on a dark terminal", () => {
    expect.hasAssertions();

    expect(getPersonaCharacter({ displayName, element: "Pyro", name: "Hu Tao" }).color).toBe("#c66173");
  });

  test("takes the element's colour for a character with none of their own", () => {
    expect.hasAssertions();

    const element = "Anemo";
    const color = ElementColorMap[element];
    assert.exists(color);

    expect(getPersonaCharacter({ displayName, element, name }).color).toBe(color);
  });

  test.each(["", "None"])("has no colour for the element %j", (element) => {
    expect.hasAssertions();

    expect(getPersonaCharacter({ displayName, element, name }).color).toBe("");
  });
});
