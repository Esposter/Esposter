import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { getBudgetFindings } from "#src/services/sweeps/skillDocs/getBudgetFindings";
import { getDescriptionFindings } from "#src/services/sweeps/skillDocs/getDescriptionFindings";
import { getDocsRouteFindings } from "#src/services/sweeps/skillDocs/getDocsRouteFindings";
import { getSelfCitationFindings } from "#src/services/sweeps/skillDocs/getSelfCitationFindings";
import { getSettledOrderFindings } from "#src/services/sweeps/skillDocs/getSettledOrderFindings";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";
import { getTriggerlessFindings } from "#src/services/sweeps/skillDocs/getTriggerlessFindings";
import { getUnindexedFindings } from "#src/services/sweeps/skillDocs/getUnindexedFindings";
import { getUnresolvedFindings } from "#src/services/sweeps/skillDocs/getUnresolvedFindings";
import { readSkillDocsFiles } from "#src/services/sweeps/skillDocs/readSkillDocsFiles";

// Every check over the skill tree, in one read: the sweep prints them and the workspace test refuses all but the budget
export const readSkillDocsFindings = (): SkillDocsFinding[] => {
  const skills = readSkillDocsFiles(`${SKILLS_DIRECTORY}/*/SKILL.md`);
  const pages = readSkillDocsFiles(`${SKILLS_DIRECTORY}/*/references/*.md`);
  const files = [...skills, ...pages];
  const paths = new Set(files.map(({ path }) => path));
  return [
    ...getBudgetFindings(skills),
    ...getDescriptionFindings(skills),
    ...getSelfCitationFindings(pages, new Set(skills.map(({ path }) => getSkillName(path)))),
    ...getSettledOrderFindings(skills),
    ...getTriggerlessFindings(pages),
    ...getUnindexedFindings(skills, pages),
    ...getDocsRouteFindings(files),
    ...getUnresolvedFindings(files, paths),
  ];
};
