import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { CITATION_REGEX } from "#src/services/sweeps/skillDocs/constants";
import { getCitedSkillNames } from "#src/services/sweeps/skillDocs/getCitedSkillNames";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

// A page pointing the reader at itself is a block moved off `SKILL.md` with its pointer still attached, and it is
// Almost always a restatement of the rule the page already states above it. A line naming another skill cites that
// Skill's page of the same name, so it is not one.
export const getSelfCitationFindings = (pages: SkillDocsFile[], skillNames: Set<string>): SkillDocsFinding[] =>
  pages.flatMap(({ path, text }) => {
    const skill = getSkillName(path);
    const self = path.slice(path.lastIndexOf("/") + 1);
    return text
      .split("\n")
      .filter(
        (line) =>
          getCitedSkillNames(line, skill, skillNames).length === 0 &&
          Array.from(line.matchAll(CITATION_REGEX), (match) => match.groups?.target).includes(self),
      )
      .map((line) => ({ detail: line.trim().slice(0, 80), path, type: SkillDocsFindingType.SelfCitation }));
  });
