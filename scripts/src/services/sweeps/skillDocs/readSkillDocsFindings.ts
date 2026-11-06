import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { readWorkingTreeFiles } from "#src/services/shared/readWorkingTreeFiles";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { getBareSkillCitationFindings } from "#src/services/sweeps/skillDocs/getBareSkillCitationFindings";
import { getBudgetFindings } from "#src/services/sweeps/skillDocs/getBudgetFindings";
import { getDanglingLeadInFindings } from "#src/services/sweeps/skillDocs/getDanglingLeadInFindings";
import { getDescriptionFindings } from "#src/services/sweeps/skillDocs/getDescriptionFindings";
import { getPositionalPointerFindings } from "#src/services/sweeps/skillDocs/getPositionalPointerFindings";
import { getSelfCitationFindings } from "#src/services/sweeps/skillDocs/getSelfCitationFindings";
import { getSettledOrderFindings } from "#src/services/sweeps/skillDocs/getSettledOrderFindings";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";
import { getTriggerlessFindings } from "#src/services/sweeps/skillDocs/getTriggerlessFindings";
import { getUnindexedFindings } from "#src/services/sweeps/skillDocs/getUnindexedFindings";
import { getUnresolvedFindings } from "#src/services/sweeps/skillDocs/getUnresolvedFindings";

// Every check over the skill tree, in one read: the sweep prints them and the workspace test refuses all but the budget
export const readSkillDocsFindings = (): SkillDocsFinding[] => {
  const documents = readWorkingTreeFiles(`${SKILLS_DIRECTORY}/*/SKILL.md`, `${SKILLS_DIRECTORY}/*/references/*.md`);
  // A skill's own file is `<skill>/SKILL.md`, which a page under `references/` never is, even when it is named SKILL.md
  const isSkillFile = (file: QueueFile) => file.path === `${SKILLS_DIRECTORY}/${getSkillName(file.path)}/SKILL.md`;
  const skills = documents.filter(isSkillFile);
  const pages = documents.filter((file) => !isSkillFile(file));
  const files = [...skills, ...pages];
  const paths = new Set(files.map(({ path }) => path));
  const skillNames = new Set(skills.map(({ path }) => getSkillName(path)));
  return [
    ...getBareSkillCitationFindings(files, skillNames),
    ...getBudgetFindings(skills),
    ...getDanglingLeadInFindings(files),
    ...getDescriptionFindings(skills),
    ...getSelfCitationFindings(pages, skillNames),
    ...getSettledOrderFindings(skills, pages),
    ...getTriggerlessFindings(pages),
    ...getUnindexedFindings(skills, pages),
    ...getPositionalPointerFindings(files),
    ...getUnresolvedFindings(files, paths),
  ];
};
