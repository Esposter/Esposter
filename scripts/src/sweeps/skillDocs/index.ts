import type { SkillDocsFile } from "#src/sweeps/skillDocs/models/SkillDocsFile";

import { REPOSITORY_ROOT } from "#src/services/constants";
import { getSweepFilePaths } from "#src/sweeps/getSweepFilePaths";
import { getBudgetFindings } from "#src/sweeps/skillDocs/getBudgetFindings";
import { getDocsRouteFindings } from "#src/sweeps/skillDocs/getDocsRouteFindings";
import { getUnindexedFindings } from "#src/sweeps/skillDocs/getUnindexedFindings";
import { getUnresolvedFindings } from "#src/sweeps/skillDocs/getUnresolvedFindings";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readFiles = (glob: string): SkillDocsFile[] =>
  getSweepFilePaths(glob).map((path) => ({ path, text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8") }));

const skills = readFiles(".agents/skills/*/SKILL.md");
const pages = readFiles(".agents/skills/*/references/*.md");
const paths = new Set([...skills, ...pages].map(({ path }) => path));

for (const { detail, path, type } of [
  ...getBudgetFindings(skills),
  ...getUnindexedFindings(skills, pages),
  ...getDocsRouteFindings([...skills, ...pages]),
  ...getUnresolvedFindings([...skills, ...pages], paths),
])
  console.info(`${type.padEnd(11)} ${path}: ${detail}`);
