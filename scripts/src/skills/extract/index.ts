import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Moves SKILL.md blocks onto reference pages from a spec file (`ExtractSpec`), the edit a skill pass makes most. The
// Spec is read relative to where the command runs, so it can live in a scratchpad
const specPath = process.argv[2];
if (!specPath) throw new InvalidOperationError(Operation.Read, "ai:skills:extract", "pass the path of a spec file");

const spec = parseMachineJson<ExtractSpec>(
  readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), specPath), "utf8"),
);
const skillDirectory = join(REPOSITORY_ROOT, SKILLS_DIRECTORY, spec.skill);
const referencesDirectory = join(skillDirectory, "references");
const skillPath = join(skillDirectory, "SKILL.md");
const { pages, skillText } = extractMoves(spec, readFileSync(skillPath, "utf8"), (page) => {
  const pagePath = join(referencesDirectory, `${page}.md`);
  return existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
});
mkdirSync(referencesDirectory, { recursive: true });
for (const [page, text] of pages) writeFileSync(join(referencesDirectory, `${page}.md`), text);
writeFileSync(skillPath, skillText);
console.info(`${spec.skill}: SKILL.md ${Buffer.byteLength(skillText)} bytes, ${pages.size} pages written`);
