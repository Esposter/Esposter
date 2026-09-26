import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { indexPages } from "#src/services/skills/extract/indexPages";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Moves blocks of a SKILL.md, or of one of its pages, onto reference pages from a spec file (`ExtractSpec`), the edit
// A skill pass makes most. The spec is read relative to where the command runs, so it can live in a scratchpad
const specPath = process.argv[2];
if (!specPath) throw new InvalidOperationError(Operation.Read, "ai:skills:extract", "pass the path of a spec file");

const spec = parseMachineJson<ExtractSpec>(
  readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), specPath), "utf8"),
);
const skillDirectory = join(REPOSITORY_ROOT, SKILLS_DIRECTORY, spec.skill);
const referencesDirectory = join(skillDirectory, "references");
const skillPath = join(skillDirectory, "SKILL.md");
const getPagePath = (page: string) => join(referencesDirectory, `${page}.md`);
const sourcePath = spec.source === undefined ? skillPath : getPagePath(spec.source);
const { indexLines, pages, sourceText } = extractMoves(spec, readFileSync(sourcePath, "utf8"), (page) => {
  const pagePath = getPagePath(page);
  return existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
});
mkdirSync(referencesDirectory, { recursive: true });
for (const [page, text] of pages) writeFileSync(getPagePath(page), text);
writeFileSync(sourcePath, sourceText);
const skillText = indexPages(readFileSync(skillPath, "utf8"), indexLines, spec.indexHeading);
writeFileSync(skillPath, skillText);
console.info(`${spec.skill}: SKILL.md ${Buffer.byteLength(skillText)} bytes, ${pages.size} pages written`);
