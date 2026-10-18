import { toWeaponPassive } from "#src/services/genshinAssets/stats/toWeaponPassive";
import { Attribute } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toWeaponPassive, () => {
  const AFFIX_ID = 1;
  const NAME_TEXT_HASH = 3;

  test("orders the ranks by level and cuts every rank to the widest rank's last used place", () => {
    expect.hasAssertions();

    expect(
      toWeaponPassive(
        [
          {
            addProps: [],
            descTextMapHash: 2,
            id: AFFIX_ID,
            level: 1,
            nameTextMapHash: NAME_TEXT_HASH,
            paramList: [0.15, 0, 0, 0],
          },
          {
            addProps: [],
            descTextMapHash: 1,
            id: AFFIX_ID,
            level: 0,
            nameTextMapHash: NAME_TEXT_HASH,
            paramList: [0.12, 0, 4, 0],
          },
        ],
        [],
      ),
    ).toStrictEqual({
      passiveNameTextId: String(NAME_TEXT_HASH),
      passiveRankAttributeLines: [[], []],
      passiveRankDescriptionTextIds: ["1", "2"],
      passiveRankParams: [
        [0.12, 0, 4],
        [0.15, 0, 0],
      ],
    });
  });

  test("gives each rank's stats as attribute lines, and notes a prop no attribute names", () => {
    expect.hasAssertions();

    const notes: string[] = [];
    expect(
      toWeaponPassive(
        [
          {
            addProps: [{ GGKIEIJLCJJ: 0.2, propType: "FIGHT_PROP_ATTACK_PERCENT" }, {}, {}],
            descTextMapHash: 1,
            id: AFFIX_ID,
            level: 0,
            nameTextMapHash: NAME_TEXT_HASH,
            paramList: [0.2, 0, 0, 0],
          },
          {
            addProps: [{ GGKIEIJLCJJ: 0.1, propType: "FIGHT_PROP_ADD_HURT" }, {}, {}],
            descTextMapHash: 2,
            id: AFFIX_ID,
            level: 1,
            nameTextMapHash: NAME_TEXT_HASH,
            paramList: [0.25, 0, 0, 0],
          },
        ],
        notes,
      ).passiveRankAttributeLines,
    ).toStrictEqual([[{ attribute: Attribute.AttackPercent, value: 0.2 }], []]);
    expect(notes).toStrictEqual(["FIGHT_PROP_ADD_HURT names no attribute; its line is left out"]);
  });

  test("gives an empty passive where there are no rows", () => {
    expect.hasAssertions();

    expect(toWeaponPassive([], [])).toStrictEqual({
      passiveNameTextId: "",
      passiveRankAttributeLines: [],
      passiveRankDescriptionTextIds: [],
      passiveRankParams: [],
    });
  });
});
