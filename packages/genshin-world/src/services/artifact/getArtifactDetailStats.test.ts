import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";

import { Attribute } from "#src/models/character/Attribute";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getArtifactDetailStats } from "#src/services/artifact/getArtifactDetailStats";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(getArtifactDetailStats, () => {
  // The five-star curves a level from +0: a flat main affix and a percentage one
  const artifactMainAffixCurves: ArtifactMainAffixCurve[] = [
    { attribute: Attribute.Health, rarity: 5, values: [717.4] },
    { attribute: Attribute.HealthPercent, rarity: 5, values: [0.0466] },
  ];

  test("a locked artifact's stats say it is locked", () => {
    expect.hasAssertions();

    expect(
      getArtifactDetailStats(createArtifact({ isLocked: true }), ENGLISH_GAME_TEXT, artifactMainAffixCurves).isLocked,
    ).toBe(true);
  });

  test("the main stat is named and its value reads its curve, a flat attribute whole", () => {
    expect.hasAssertions();

    expect(
      getArtifactDetailStats(
        createArtifact({ mainAffix: Attribute.Health }),
        ENGLISH_GAME_TEXT,
        artifactMainAffixCurves,
      ),
    ).toStrictEqual({
      isLocked: false,
      mainStat: { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeMaxHealth], value: "+717" },
      subStats: [],
    });
  });

  test("a percentage main stat is its value to one place", () => {
    expect.hasAssertions();

    expect(
      getArtifactDetailStats(
        createArtifact({ mainAffix: Attribute.HealthPercent }),
        ENGLISH_GAME_TEXT,
        artifactMainAffixCurves,
      ).mainStat.value,
    ).toBe("+4.7%");
  });

  test("each minor affix is named, a flat attribute whole and a percentage to one place", () => {
    expect.hasAssertions();

    const minorAffixes = [
      { attribute: Attribute.Attack, value: 19 },
      { attribute: Attribute.CriticalRate, value: 0.031 },
    ];
    expect(
      getArtifactDetailStats(
        createArtifact({ mainAffix: Attribute.Health, minorAffixes }),
        ENGLISH_GAME_TEXT,
        artifactMainAffixCurves,
      ).subStats,
    ).toStrictEqual([
      { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeAttack], value: "+19" },
      { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeCriticalRate], value: "+3.1%" },
    ]);
  });

  // A Defense % affix is captioned DEF, the caption a weapon's Defense % secondary takes
  test("a Defense % affix is captioned DEF", () => {
    expect.hasAssertions();

    const minorAffixes = [{ attribute: Attribute.DefensePercent, value: 0.058 }];
    expect(
      getArtifactDetailStats(
        createArtifact({ mainAffix: Attribute.Health, minorAffixes }),
        ENGLISH_GAME_TEXT,
        artifactMainAffixCurves,
      ).subStats,
    ).toStrictEqual([{ label: ENGLISH_GAME_TEXT[GameTextKey.AttributeDefense], value: "+5.8%" }]);
  });

  test("an attribute no artifact affix names is refused", () => {
    expect.hasAssertions();

    expect(() =>
      getArtifactDetailStats(
        createArtifact({ mainAffix: Attribute.MovementSpeed }),
        ENGLISH_GAME_TEXT,
        artifactMainAffixCurves,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getAffixLabel, FIGHT_PROP_MOVE_SPEED]`,
    );
  });
});
