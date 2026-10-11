import { GCSIM_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readGcsimAttacks, () => {
  test("reads Xiangling's normal attack literal, its multiplier followed through the loop over `attack`", () => {
    expect.hasAssertions();

    const name = "attack.go";
    const sources = [{ name, source: readFileSync(join(GCSIM_FIXTURE_DIRECTORY, name), "utf8") }];

    expect(readGcsimAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        attackTag: "attacks.AttackTagNormal",
        durability: 25,
        element: "attributes.Physical",
        fieldLineMap: {
          Abil: 57,
          ActorIndex: 56,
          AttackTag: 59,
          CanBeDefenseHalted: 67,
          Durability: 64,
          Element: 63,
          HitlagFactor: 65,
          HitlagHaltFrames: 66,
          ICDGroup: 61,
          ICDTag: 60,
          Mult: 58,
          StrikeType: 62,
        },
        file: name,
        internalCooldownTag: "attacks.ICDTagNormalAttack",
        line: 55,
        poiseDamage: undefined,
        poiseDamageVariable: undefined,
        strikeType: "attacks.StrikeTypeSpear",
        talentVariable: "attack",
      },
    ]);
  });
});
