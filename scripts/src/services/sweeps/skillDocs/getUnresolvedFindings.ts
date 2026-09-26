import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { CITATION_REGEX } from "#src/services/sweeps/skillDocs/constants";
import { getCitedSkillNames } from "#src/services/sweeps/skillDocs/getCitedSkillNames";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

// A `references/…` pointer nothing resolves, which no build fails on. A line naming **another** skill cites that
// Skill's page rather than this one's, so the citation is resolved against every skill the line names as well as
// Against the owning one. Suppressing such a line outright is what a cross-skill pointer that dangles hides behind.
export const getUnresolvedFindings = (files: SkillDocsFile[], paths: Set<string>): SkillDocsFinding[] => {
  const skillNames = new Set(files.map(({ path }) => getSkillName(path)));
  return files.flatMap(({ path, text }) => {
    const skill = getSkillName(path);
    return text.split("\n").flatMap((line) => {
      const owners = [skill, ...getCitedSkillNames(line, skill, skillNames)];
      return [...new Set(Array.from(line.matchAll(CITATION_REGEX), (match) => match.groups?.target ?? ""))]
        .filter((target) => !owners.some((owner) => paths.has(`${SKILLS_DIRECTORY}/${owner}/references/${target}`)))
        .map((target) => ({ detail: `-> ${target}`, path, type: SkillDocsFindingType.Unresolved }));
    });
  });
};
