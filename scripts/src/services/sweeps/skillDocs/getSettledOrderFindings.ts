import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getFencedLines } from "#src/services/skills/extract/getFencedLines";
import { SETTLED_HEADING } from "#src/services/sweeps/skillDocs/constants";

const SETTLED_PREFIX = "## Settled";
// A rejection a reader would propose is found only where they look first, so the list is its skill's first
// Section under the one heading. A reworded heading or a list on a reference page reads the same to a person and
// Escapes the order check, which is how rejections drift to the foot of a page nobody opens before proposing. A
// Heading inside a fenced example is not one
const getHeadings = (text: string) => {
  const lines = text.split("\n");
  const fencedLines = getFencedLines(lines);
  return lines.filter((line, index) => !fencedLines[index] && line.startsWith("## "));
};

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
