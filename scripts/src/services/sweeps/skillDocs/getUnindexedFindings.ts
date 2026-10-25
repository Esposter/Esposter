import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { checkIsIndexLine } from "#src/services/sweeps/skillDocs/checkIsIndexLine";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

export const getUnindexedFindings = (skills: SkillDocsFile[], pages: SkillDocsFile[]): SkillDocsFinding[] => {
  const skillLinesMap = new Map(skills.map(({ path, text }) => [getSkillName(path), text.split("\n")]));
  return pages
    .filter(({ path }) => {
      const citation = `\`references/${path.split("/").at(-1) ?? ""}\``;
      return !(skillLinesMap.get(getSkillName(path)) ?? []).some((line) => checkIsIndexLine(line, citation));
    })
    .map(({ path }) => ({ detail: "no SKILL.md index line names it", path, type: SkillDocsFindingType.Unindexed }));
};
