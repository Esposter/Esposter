import type { ExcelFishSkillRow } from "#src/models/genshinAssets/fishing/ExcelFishSkillRow";

export const toFishSkill = (row: ExcelFishSkillRow): ExcelFishSkillRow => ({
  bonusDuration: row.bonusDuration,
  bonusOffset: row.bonusOffset,
  bonusSpeed: row.bonusSpeed,
  bonusWidth: row.bonusWidth,
  duration: row.duration,
  forceFactor: row.forceFactor,
  id: row.id,
  param: row.param,
  priority: row.priority,
  skillCategory: row.skillCategory,
  skillType: row.skillType,
});
