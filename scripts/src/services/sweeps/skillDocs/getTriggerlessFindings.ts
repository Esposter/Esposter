import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";

// A reference page is reached by search as often as by its index line, so its opening prose is the only thing
// Telling that reader whether the page is theirs. The opening is a fixed shape for the same reason the Settled
// List is one — a form a pattern can read is a form nothing has to re-judge (`skill-authoring`,
// `references/splitting-a-skill.md`).
const OPENING_PREFIX = "Read ";

export const getTriggerlessFindings = (pages: SkillDocsFile[]): SkillDocsFinding[] =>
  pages
    .map(({ path, text }) => {
      const [title, ...rest] = text.split("\n");
      return { opening: rest.find((line) => line.trim().length > 0) ?? "", path, title: title ?? "" };
    })
    .filter(({ opening, title }) => title.startsWith("# ") && !opening.startsWith(OPENING_PREFIX))
    .map(({ path }) => ({
      detail: `its first paragraph does not open "${OPENING_PREFIX.trim()} …"`,
      path,
      type: SkillDocsFindingType.Triggerless,
    }));
