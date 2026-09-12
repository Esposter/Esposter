import { getBudgetFindings } from "#src/services/sweeps/skillDocs/getBudgetFindings";
import { getDocsRouteFindings } from "#src/services/sweeps/skillDocs/getDocsRouteFindings";
import { getUnindexedFindings } from "#src/services/sweeps/skillDocs/getUnindexedFindings";
import { getUnresolvedFindings } from "#src/services/sweeps/skillDocs/getUnresolvedFindings";
import { readSkillDocsFiles } from "#src/services/sweeps/skillDocs/readSkillDocsFiles";

const skills = readSkillDocsFiles(".agents/skills/*/SKILL.md");
const pages = readSkillDocsFiles(".agents/skills/*/references/*.md");
const files = [...skills, ...pages];
const paths = new Set(files.map(({ path }) => path));

for (const { detail, path, type } of [
  ...getBudgetFindings(skills),
  ...getUnindexedFindings(skills, pages),
  ...getDocsRouteFindings(files),
  ...getUnresolvedFindings(files, paths),
])
  console.info(`${type.padEnd(11)} ${path}: ${detail}`);
