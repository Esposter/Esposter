import { toConstellationRaise } from "#src/services/genshinAssets/stats/toConstellationRaise";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

const PROUD_SKILL_GROUP_IDS = {
  [CombatTalent.ElementalBurst]: 239,
  [CombatTalent.ElementalSkill]: 232,
  [CombatTalent.NormalAttack]: 231,
};
const SKILL_NAMES = {
  [CombatTalent.ElementalBurst]: "Soumetsu",
  [CombatTalent.ElementalSkill]: "Hyouka",
  [CombatTalent.NormalAttack]: "Frostflake",
};
const SCRAMBLED_ACTION = { $type: "CJJAJHDMAHL", CCDDFPKKMDK: 9, MONCLPCEMJG: "AvatarSkill", PLLGLGGOCHL: 3 };
const PLAIN_ACTION = { $type: "MDAHCMHCOGN", extraLevel: 3, talentIndex: 2, talentType: "AvatarSkill" };

describe(toConstellationRaise, () => {
  test("raises the talent whose proud skill group ends in the action's slot, in either shape", () => {
    expect.hasAssertions();

    const descriptionText = "Increases the Level of Soumetsu by 3.";
    expect(
      toConstellationRaise([SCRAMBLED_ACTION], {
        descriptionText,
        proudSkillGroupIds: PROUD_SKILL_GROUP_IDS,
        skillNames: SKILL_NAMES,
      }),
    ).toStrictEqual({ levels: 3, talent: CombatTalent.ElementalBurst });
    expect(
      toConstellationRaise([PLAIN_ACTION], {
        descriptionText: "Increases the Level of Hyouka by 3.",
        proudSkillGroupIds: PROUD_SKILL_GROUP_IDS,
        skillNames: SKILL_NAMES,
      }),
    ).toStrictEqual({ levels: 3, talent: CombatTalent.ElementalSkill });
  });

  test("raises nothing where there is no skill action", () => {
    expect.hasAssertions();

    expect(
      toConstellationRaise([{ $type: "MFHGMOAGIMA", GDKNKODKBNO: "Avatar_Ayaka_Constellation_1" }], {
        descriptionText: "",
        proudSkillGroupIds: PROUD_SKILL_GROUP_IDS,
        skillNames: SKILL_NAMES,
      }),
    ).toBeUndefined();
  });

  test("refuses a description that names another talent than the action's slot", () => {
    expect.hasAssertions();

    expect(() =>
      toConstellationRaise([SCRAMBLED_ACTION], {
        descriptionText: "Increases the Level of Hyouka by 3.",
        proudSkillGroupIds: PROUD_SKILL_GROUP_IDS,
        skillNames: SKILL_NAMES,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: toConstellationRaise, the description does not name ElementalBurst]`,
    );
  });
});
