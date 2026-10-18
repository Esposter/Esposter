import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeDefeatWeeklyBossTrounceBlossom } from "#src/services/bosses/computeDefeatWeeklyBossTrounceBlossom";
import { describe, expect, test } from "vitest";

describe(computeDefeatWeeklyBossTrounceBlossom, () => {
  const place = { x: 1, z: 2 };

  test("a defeated weekly boss leaves an unclaimed weekly Trounce Blossom at its place", () => {
    expect.hasAssertions();

    expect(computeDefeatWeeklyBossTrounceBlossom(EnemyKindId.StormterrorDvalin, place)).toStrictEqual({
      claimedAts: [],
      kind: BlossomKind.WeeklyBoss,
      place,
    });
  });

  test("a defeated common enemy leaves no weekly Trounce Blossom", () => {
    expect.hasAssertions();

    expect(computeDefeatWeeklyBossTrounceBlossom(EnemyKindId.AnemoSlime, place)).toBeUndefined();
  });
});
