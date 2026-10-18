import type { GameText } from "genshin-text";

import { Attribute, Attributes } from "#src/models/character/Attribute";
import { getAttributeDetailGroups } from "#src/services/character/getAttributeDetailGroups";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

// Every label is its own text id, so a row or a title shows which game text it was given
const gameText = Object.fromEntries(Object.values(GameTextKey).map((key) => [key, key])) as GameText;
const attributeTotalMap = Object.fromEntries(Attributes.map((attribute) => [attribute, 0]));

describe("getAttributeDetailGroups", () => {
  // Details opened: the base, advanced and elemental groups in the game's order, each attribute under its own title
  test("details lists the advanced and elemental attributes beyond the summary", () => {
    expect.hasAssertions();

    const groups = getAttributeDetailGroups(
      { ...attributeTotalMap, [Attribute.IncomingHealingBonus]: 0.5, [Attribute.PyroResistance]: 0.1 },
      gameText,
      true,
    );

    expect(groups.map(({ title }) => title)).toStrictEqual([
      GameTextKey.AttributeGroupBase,
      GameTextKey.AttributeGroupAdvanced,
      GameTextKey.AttributeGroupElemental,
    ]);
    expect(groups[1]?.rows).toContainEqual({ label: GameTextKey.AttributeIncomingHealingBonus, value: "50.0%" });
    expect(groups[2]?.rows).toContainEqual({ label: GameTextKey.AttributePyroResistance, value: "10.0%" });
  });

  // Details pressed again: no group is listed, so the summary is all the panel shows
  test("pressing Details again closes the list", () => {
    expect.hasAssertions();

    expect(getAttributeDetailGroups(attributeTotalMap, gameText, false)).toStrictEqual([]);
  });
});
