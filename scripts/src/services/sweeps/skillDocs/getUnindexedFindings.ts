import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

// A reference page is loaded by the trigger-named index line in its own SKILL.md — nothing else reaches it, so
// A page no line names is a page no pass ever opens, however good it is.
export const getUnindexedFindings = (skills: SkillDocsFile[], pages: SkillDocsFile[]): SkillDocsFinding[] => {
  const skillTexts = new Map(skills.map(({ path, text }) => [getSkillName(path), text]));
  return pages
    .filter(({ path }) => {
      const fileName = path.split("/").at(-1) ?? "";
      return !(skillTexts.get(getSkillName(path)) ?? "").includes(`references/${fileName}`);
    })
    .map(({ path }) => ({ detail: "no SKILL.md line names it", path, type: SkillDocsFindingType.Unindexed }));
};
