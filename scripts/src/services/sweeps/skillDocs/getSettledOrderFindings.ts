import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { SETTLED_HEADING } from "#src/services/sweeps/skillDocs/constants";

export const getSettledOrderFindings = (skills: SkillDocsFile[]): SkillDocsFinding[] =>
  skills
    .map(({ path, text }) => ({ headings: text.split("\n").filter((line) => line.startsWith("## ")), path }))
    .filter(({ headings }) => headings.includes(SETTLED_HEADING) && headings[0] !== SETTLED_HEADING)
    .map(({ path }) => ({
      detail: `its ${SETTLED_HEADING} list is not the first section`,
      path,
      type: SkillDocsFindingType.SettledOrder,
    }));
