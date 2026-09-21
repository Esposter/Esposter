import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ANSI_RESET, ElementColorMap, NAMEPLATE_PREFIX } from "#src/services/constants";
import { formatNameplate } from "#src/services/formatNameplate";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { assert, describe, expect, test } from "vitest";

describe(formatNameplate, () => {
  // The display name is what is drawn and the English name is only the identity, so they differ here
  const displayName = "displayName";
  const name = "name";

  test("wraps the nameplate in the character's own colour ahead of the element's", () => {
    expect.hasAssertions();

    const characterName = "Hu Tao";
    const color = CharacterColorMap[characterName];
    assert.exists(color);

    expect(formatNameplate({ displayName, element: "Pyro", name: characterName })).toBe(
      `${getAnsiForegroundColor(color)}${NAMEPLATE_PREFIX}${displayName}${ANSI_RESET}`,
    );
  });

  test.each(Object.entries(ElementColorMap))(
    "wraps a nameplate with no colour of its own in %s's",
    (element, color) => {
      expect.hasAssertions();

      expect(formatNameplate({ displayName, element, name })).toBe(
        `${getAnsiForegroundColor(color)}${NAMEPLATE_PREFIX}${displayName}${ANSI_RESET}`,
      );
    },
  );

  test.each(["", "None"])("leaves the nameplate plain for the element %j", (element) => {
    expect.hasAssertions();

    expect(formatNameplate({ displayName, element, name })).toBe(`${NAMEPLATE_PREFIX}${displayName}`);
  });
});
