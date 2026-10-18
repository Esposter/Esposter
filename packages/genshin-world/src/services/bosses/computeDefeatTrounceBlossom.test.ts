import { EnemyType } from "#src/models/enemy/EnemyType";
import { computeDefeatTrounceBlossom } from "#src/services/bosses/computeDefeatTrounceBlossom";
import { describe, expect, test } from "vitest";

describe(computeDefeatTrounceBlossom, () => {
  const place = { x: 1, z: 2 };

  test("a defeated normal boss leaves a Trounce Blossom at its place", () => {
    expect.hasAssertions();

    expect(computeDefeatTrounceBlossom(EnemyType.Boss, place)).toStrictEqual({ place });
  });

  test("a defeated common enemy leaves no Trounce Blossom", () => {
    expect.hasAssertions();

    expect(computeDefeatTrounceBlossom(EnemyType.Common, place)).toBeUndefined();
  });
});
