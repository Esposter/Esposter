import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";

// A settled direction written two thirds down a skill is re-derived by the reader who loaded the very skill that
// Rejects it, so the list is the first section or it is not doing its job (`skill-authoring`,
// `references/settled-lists.md`). The heading is one fixed string for the same reason the opening line is:
// A shape decides, an intent has to be judged.
const SETTLED_HEADING = "## Settled — do not re-propose";

export const getSettledOrderFindings = (skills: SkillDocsFile[]): SkillDocsFinding[] =>
  skills
    .map(({ path, text }) => ({ headings: text.split("\n").filter((line) => line.startsWith("## ")), path }))
    .filter(({ headings }) => headings.includes(SETTLED_HEADING) && headings[0] !== SETTLED_HEADING)
    .map(({ path }) => ({
      detail: `its ${SETTLED_HEADING} list is not the first section`,
      path,
      type: SkillDocsFindingType.SettledOrder,
    }));
