import { toCookingTalentOwnerMap } from "#src/services/genshinAssets/cooking/toCookingTalentOwnerMap";
import { describe, expect, test } from "vitest";

describe(toCookingTalentOwnerMap, () => {
  const GROUP_ID = 2323;
  const OTHER_GROUP_ID = 4623;

  test("should give each passive group to the character that names it", () => {
    expect.hasAssertions();

    expect(
      toCookingTalentOwnerMap([{ characterId: 10_023, passives: [{ proudSkillGroupId: GROUP_ID }] }]),
    ).toStrictEqual(new Map([[GROUP_ID, 10_023]]));
  });

  test("should give a passive group several characters name to the lowest character id", () => {
    expect.hasAssertions();

    expect(
      toCookingTalentOwnerMap([
        { characterId: 10_901, passives: [{ proudSkillGroupId: GROUP_ID }] },
        { characterId: 10_023, passives: [{ proudSkillGroupId: GROUP_ID }, { proudSkillGroupId: OTHER_GROUP_ID }] },
        { characterId: 10_904, passives: [{ proudSkillGroupId: GROUP_ID }] },
      ]),
    ).toStrictEqual(
      new Map([
        [GROUP_ID, 10_023],
        [OTHER_GROUP_ID, 10_023],
      ]),
    );
  });
});
