import { toWeaponPassive } from "#src/services/genshinAssets/stats/toWeaponPassive";
import { describe, expect, test } from "vitest";

describe(toWeaponPassive, () => {
  const AFFIX_ID = 1;
  const NAME_TEXT_HASH = 3;

  test("orders the ranks by level and cuts every rank to the widest rank's last used place", () => {
    expect.hasAssertions();

    expect(
      toWeaponPassive([
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
      ]),
    ).toStrictEqual({
      passiveNameTextId: String(NAME_TEXT_HASH),
      passiveRankDescriptionTextIds: ["1", "2"],
      passiveRankParams: [
        [0.12, 0, 4],
        [0.15, 0, 0],
      ],
    });
  });

  test("gives an empty passive where there are no rows", () => {
    expect.hasAssertions();

    expect(toWeaponPassive([])).toStrictEqual({
      passiveNameTextId: "",
      passiveRankDescriptionTextIds: [],
      passiveRankParams: [],
    });
  });
});
