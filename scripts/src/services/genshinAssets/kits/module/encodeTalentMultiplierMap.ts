import type { TalentMultiplierMap } from "genshin-world";

import { encodeKitParameter } from "#src/services/genshinAssets/kits/module/encodeKitParameter";

// A character's multipliers with each parameter replaced by a number naming its own group and index, so a kit built
// From them shows which parameter each of its values reads. The numbers are tiny, so a kit counting or sizing anything
// By a parameter stays small
export const encodeTalentMultiplierMap = (talentMultiplierMap: TalentMultiplierMap): TalentMultiplierMap =>
  Object.fromEntries(
    Object.entries(talentMultiplierMap).map(([proudSkillGroupId, multipliers]) => [
      proudSkillGroupId,
      multipliers.map(({ level, paramList }) => ({
        level,
        paramList: paramList.map((_parameter, index) =>
          encodeKitParameter({ index, proudSkillGroupId: Number(proudSkillGroupId) }),
        ),
      })),
    ]),
  );
