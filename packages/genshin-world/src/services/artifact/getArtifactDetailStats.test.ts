import type { Artifact } from "#src/models/artifact/Artifact";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getArtifactDetailStats } from "#src/services/artifact/getArtifactDetailStats";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const createArtifact = (mainAffix: Attribute, minorAffixes: Artifact["minorAffixes"]): Artifact => ({
  experience: 0,
  isLocked: false,
  level: 0,
  mainAffix,
  minorAffixes,
  rarity: 5,
  setId: 1,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(getArtifactDetailStats, () => {
  test("the main stat is named and its value waits on its table", () => {
    expect.hasAssertions();

    expect(getArtifactDetailStats(createArtifact(Attribute.Health, []), ENGLISH_GAME_TEXT)).toStrictEqual({
      mainStat: { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeMaxHealth], value: "" },
      subStats: [],
    });
  });

  test("each minor affix is named, a flat attribute whole and a percentage to one place", () => {
    expect.hasAssertions();

    const minorAffixes = [
      { attribute: Attribute.Attack, value: 19 },
      { attribute: Attribute.CriticalRate, value: 0.031 },
    ];
    expect(
      getArtifactDetailStats(createArtifact(Attribute.Health, minorAffixes), ENGLISH_GAME_TEXT).subStats,
    ).toStrictEqual([
      { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeAttack], value: "+19" },
      { label: ENGLISH_GAME_TEXT[GameTextKey.AttributeCriticalRate], value: "+3.1%" },
    ]);
  });

  test("an attribute no artifact affix names is refused", () => {
    expect.hasAssertions();

    expect(() =>
      getArtifactDetailStats(createArtifact(Attribute.BaseHealth, []), ENGLISH_GAME_TEXT),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getAffixLabel, FIGHT_PROP_BASE_HP]`,
    );
  });
});
