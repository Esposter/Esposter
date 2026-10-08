import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { SkillDepot } from "genshin-world";

import { ElementNameSet } from "#src/services/genshinAssets/stats/constants";
import { skillDepotSchema } from "genshin-world";

// One skill set as the game's tables hold it: its skill, the second of its slots, and its burst, its energy skill. Each
// Is read from the skill table by its id, a zero or missing id leaving it out. A burst's element is its energy's, where
// The game names one of the seven, and none where it names none
export const toSkillDepot = (
  { energySkill, id, skills }: ExcelSkillDepotRow,
  skillMap: ReadonlyMap<number, ExcelSkillRow>,
): SkillDepot | undefined => {
  const [, skillId = 0] = skills;
  const skillRow = skillMap.get(skillId);
  const burstRow = energySkill === undefined ? undefined : skillMap.get(energySkill);
  if (skillRow === undefined && burstRow === undefined) return undefined;
  const element = burstRow?.costElemType;
  return skillDepotSchema.parse({
    ...(burstRow === undefined
      ? {}
      : {
          burst: {
            cooldownSeconds: burstRow.cdTime,
            energyCost: burstRow.costElemVal,
            ...(element === undefined || !ElementNameSet.has(element) ? {} : { element }),
          },
        }),
    depotId: id,
    ...(skillRow === undefined ? {} : { skill: { charges: skillRow.maxChargeNum, cooldownSeconds: skillRow.cdTime } }),
  });
};
