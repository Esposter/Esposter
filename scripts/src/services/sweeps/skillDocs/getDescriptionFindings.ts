import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { DESCRIPTION_OPENING, MAX_DESCRIPTION_CHARACTERS } from "#src/services/sweeps/skillDocs/constants";
import { getFrontmatterDescription } from "#src/services/sweeps/skillDocs/getFrontmatterDescription";

// The description is the only text read when a skill is picked, and the listing keeps a fixed prefix of it: a
// Trigger written last is cut off first, and a description past the cap advertises rules the listing never shows.
// So the trigger is the opening, as a fixed form for the same reason a reference page's "Read …" is one, and the
// Whole text stays inside the cap (`skill-authoring`, `references/frontmatter.md`).
export const getDescriptionFindings = (skills: SkillDocsFile[]): SkillDocsFinding[] =>
  skills.flatMap(({ path, text }) => {
    const description = getFrontmatterDescription(text);
    const findings: SkillDocsFinding[] = [];
    if (!description.startsWith(DESCRIPTION_OPENING))
      findings.push({
        detail: `its description does not open "${DESCRIPTION_OPENING.trim()} …"`,
        path,
        type: SkillDocsFindingType.DescriptionOpening,
      });
    if (description.length > MAX_DESCRIPTION_CHARACTERS)
      findings.push({ detail: `${description.length} characters`, path, type: SkillDocsFindingType.DescriptionCap });
    return findings;
  });
