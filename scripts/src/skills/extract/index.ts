import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { indexPages } from "#src/services/skills/extract/indexPages";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { defineCommand, runMain } from "citty";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

await runMain(
  defineCommand({
    args: {
      // Read relative to where the command runs, so the spec can live in a scratchpad
      spec: { description: "The path of a spec file (ExtractSpec)", required: true, type: "positional" },
    },
    meta: {
      // The edit a skill pass makes most
      description: "Move blocks of a SKILL.md, or of one of its pages, onto reference pages",
      name: "ai:skills:extract",
    },
    run: ({ args }) => {
      const spec = parseMachineJson<ExtractSpec>(
        readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), args.spec), "utf8"),
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
    },
  }),
);
