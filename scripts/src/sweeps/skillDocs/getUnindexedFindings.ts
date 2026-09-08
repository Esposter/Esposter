import type { SkillDocsFile } from "#src/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#src/sweeps/skillDocs/models/SkillDocsFinding";

import { getSkillName } from "#src/sweeps/skillDocs/getSkillName";
import { SkillDocsFindingType } from "#src/sweeps/skillDocs/models/SkillDocsFindingType";

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
