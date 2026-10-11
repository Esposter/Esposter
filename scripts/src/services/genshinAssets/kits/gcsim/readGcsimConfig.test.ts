import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { GCSIM_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { readGcsimConfig } from "#src/services/genshinAssets/kits/gcsim/readGcsimConfig";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const createLeaf = (path: number[], label: string, type = GcsimTalentType.Attack, selector = 0): GcsimTalentLeaf => ({
  path,
  reference: { label, selector, type },
});

describe(readGcsimConfig, () => {
  test("reads Xiangling's names, talent variables and hitboxes, each on the line it is named on", () => {
    expect.hasAssertions();

    const { abilityHitboxesMap, names, talentVariables } = readGcsimConfig(
      readFileSync(join(GCSIM_FIXTURE_DIRECTORY, "config.yml"), "utf8"),
    );

    expect(names).toStrictEqual(["xiangling", "xl"]);
    expect(talentVariables).toStrictEqual([
      {
        leaves: [
          createLeaf([0], "1-Hit DMG"),
          createLeaf([1], "2-Hit DMG"),
          createLeaf([2, 0], "3-Hit DMG"),
          createLeaf([2, 1], "3-Hit DMG"),
          createLeaf([3, 0], "4-Hit DMG"),
          createLeaf([3, 1], "4-Hit DMG"),
          createLeaf([3, 2], "4-Hit DMG"),
          createLeaf([3, 3], "4-Hit DMG"),
          createLeaf([4], "5-Hit DMG"),
        ],
        line: 9,
        name: "attack",
      },
      { leaves: [createLeaf([], "Charged Attack DMG")], line: 19, name: "nc" },
      { leaves: [createLeaf([], "Plunge DMG")], line: 20, name: "collision" },
      { leaves: [createLeaf([], "Low/High Plunge DMG")], line: 21, name: "lowPlunge" },
      { leaves: [createLeaf([], "Low/High Plunge DMG", GcsimTalentType.Attack, 1)], line: 22, name: "highPlunge" },
      { leaves: [createLeaf([], "Flame DMG", GcsimTalentType.Skill)], line: 24, name: "guobaTick" },
      {
        leaves: [
          createLeaf([0], "1-Hit Swing DMG", GcsimTalentType.Burst),
          createLeaf([1], "2-Hit Swing DMG", GcsimTalentType.Burst),
          createLeaf([2], "3-Hit Swing DMG", GcsimTalentType.Burst),
        ],
        line: 26,
        name: "pyronadoInitial",
      },
      { leaves: [createLeaf([], "Pyronado DMG", GcsimTalentType.Burst)], line: 30, name: "pyronadoSpin" },
    ]);
    expect(abilityHitboxesMap.get("attack")?.[0]).toStrictEqual({
      box: [1.2, 3],
      center: GcsimHitboxCenter.Player,
      line: 50,
      name: "N1",
      shape: GcsimHitboxShape.Box,
    });
    expect(abilityHitboxesMap.get("charge")).toStrictEqual([
      { center: GcsimHitboxCenter.PrimaryTarget, line: 107, name: "CA", radius: 0.8, shape: GcsimHitboxShape.Circle },
    ]);
    expect(abilityHitboxesMap.get("plunge")).toStrictEqual([
      {
        center: GcsimHitboxCenter.Player,
        line: 115,
        name: "Plunge",
        offset: [0, 1],
        radius: 1,
        shape: GcsimHitboxShape.Circle,
      },
      {
        center: GcsimHitboxCenter.Player,
        line: 121,
        name: "Low_Plunge",
        offset: [0, 1],
        radius: 3,
        shape: GcsimHitboxShape.Circle,
      },
      {
        center: GcsimHitboxCenter.Player,
        line: 127,
        name: "High_Plunge",
        offset: [0, 1],
        radius: 5,
        shape: GcsimHitboxShape.Circle,
      },
    ]);
  });
});
