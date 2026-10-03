import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ANSI_RESET, ElementColorMap, NAMEPLATE_PREFIX } from "#src/services/constants";
import { formatNameplate } from "#src/services/formatNameplate";
import { getAnsiBackgroundColor } from "#src/util/getAnsiBackgroundColor";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { assert, describe, expect, test } from "vitest";

describe(formatNameplate, () => {
  // The display name is what is drawn and the English name is only the identity, so they differ here
  const displayName = "displayName";
  const name = "name";

  test("draws the name in the character's own colour ahead of the element's, on that colour's tone", () => {
    expect.hasAssertions();

    const characterName = "Jean";
    const color = CharacterColorMap[characterName];
    assert.exists(color);

    expect(formatNameplate({ displayName, element: "Anemo", name: characterName })).toBe(
      `${getAnsiBackgroundColor("#2f2b24")}${getAnsiForegroundColor(color)} ${NAMEPLATE_PREFIX}${displayName} ${ANSI_RESET}`,
    );
  });

  test("lightens a colour too dark to read on its own tone", () => {
    expect.hasAssertions();

    expect(formatNameplate({ displayName, element: "Pyro", name: "Hu Tao" })).toBe(
      `${getAnsiBackgroundColor("#251923")}${getAnsiForegroundColor("#ca6476")} ${NAMEPLATE_PREFIX}${displayName} ${ANSI_RESET}`,
    );
  });

  test("draws a nameplate with no colour of its own in the element's", () => {
    expect.hasAssertions();

    const element = "Anemo";
    const color = ElementColorMap[element];
    assert.exists(color);

    expect(formatNameplate({ displayName, element, name })).toBe(
      `${getAnsiBackgroundColor("#192c30")}${getAnsiForegroundColor(color)} ${NAMEPLATE_PREFIX}${displayName} ${ANSI_RESET}`,
    );
  });

  test.each(["", "None"])("leaves the nameplate plain for the element %j", (element) => {
    expect.hasAssertions();

    expect(formatNameplate({ displayName, element, name })).toBe(`${NAMEPLATE_PREFIX}${displayName}`);
  });
});
