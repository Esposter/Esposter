import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { SETTLED_HEADING } from "#src/services/sweeps/skillDocs/constants";
import { getHeadings } from "#src/services/sweeps/skillDocs/getHeadings";

const SETTLED_PREFIX = "## Settled";

export const getSettledOrderFindings = (skills: SkillDocsFile[], pages: SkillDocsFile[]): SkillDocsFinding[] => [
  ...skills.flatMap(({ path, text }) => {
    const headings = getHeadings(text);
    if (headings.some((heading) => heading.startsWith(SETTLED_PREFIX) && heading !== SETTLED_HEADING))
      return [
        {
          detail: `a settled list is headed other than ${SETTLED_HEADING}`,
          path,
          type: SkillDocsFindingType.SettledOrder,
        },
      ];
    else if (headings.includes(SETTLED_HEADING) && headings[0] !== SETTLED_HEADING)
      return [
        {
          detail: `its ${SETTLED_HEADING} list is not the first section`,
          path,
          type: SkillDocsFindingType.SettledOrder,
        },
      ];
    else return [];
  }),
  ...pages
    .filter(({ text }) => getHeadings(text).some((heading) => heading.startsWith(SETTLED_PREFIX)))
    .map(({ path }) => ({
      detail: "a settled list sits on a reference page rather than first in its SKILL.md",
      path,
      type: SkillDocsFindingType.SettledOrder,
    })),
];
