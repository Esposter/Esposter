import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";

import { TALENT_START_LEVEL } from "genshin-world";

// Each proud skill group's name by its text id, read off the group's first level's row, the one a passive's name is held
// By, as a skill's own name is held by its hash, none where the hash is zero. A group with no first-level row, or whose
// Row holds no name, has no name here
export const toProudSkillNameTextIdMap = (rows: readonly ExcelProudSkillRow[]) =>
  new Map(
    rows
      .filter(({ level, nameTextMapHash }) => level === TALENT_START_LEVEL && nameTextMapHash !== 0)
      .map(({ nameTextMapHash, proudSkillGroupId }) => [proudSkillGroupId, String(nameTextMapHash)] as const),
  );
