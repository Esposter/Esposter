import type { SkillDocsFile } from "#scripts/sweeps/skillDocs/models/SkillDocsFile";

import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { getBudgetFindings } from "#scripts/sweeps/skillDocs/getBudgetFindings";
import { getDocsRouteFindings } from "#scripts/sweeps/skillDocs/getDocsRouteFindings";
import { getUnindexedFindings } from "#scripts/sweeps/skillDocs/getUnindexedFindings";
import { getUnresolvedFindings } from "#scripts/sweeps/skillDocs/getUnresolvedFindings";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");
const readFiles = (glob: string): SkillDocsFile[] =>
  getSweepFilePaths(glob).map((path) => ({ path, text: readFileSync(resolve(root, path), "utf8") }));

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
