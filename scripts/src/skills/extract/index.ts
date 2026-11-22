import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { indexPages } from "#src/services/skills/extract/indexPages";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

await runCommand(
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
      const extractSpec = parseMachineJson<ExtractSpec>(
        readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), args.spec), "utf8"),
      );
      const skillDirectory = join(REPOSITORY_ROOT, SKILLS_DIRECTORY, extractSpec.skill);
      const referencesDirectory = join(skillDirectory, "references");
      const skillPath = join(skillDirectory, "SKILL.md");
      const getPagePath = (page: string) => join(referencesDirectory, `${page}.md`);
      const sourcePath = extractSpec.source === undefined ? skillPath : getPagePath(extractSpec.source);
      const { indexLines, pageTextMap, sourceText } = extractMoves(
        extractSpec,
        readFileSync(sourcePath, "utf8"),
        (page) => {
          const pagePath = getPagePath(page);
          return existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
        },
      );
      mkdirSync(referencesDirectory, { recursive: true });
      for (const [page, text] of pageTextMap) writeFileSync(getPagePath(page), text);
      writeFileSync(sourcePath, sourceText);
      const skillText = indexPages(readFileSync(skillPath, "utf8"), indexLines, extractSpec.indexHeading);
      writeFileSync(skillPath, skillText);
      console.info(
        `${extractSpec.skill}: SKILL.md ${Buffer.byteLength(skillText)} bytes, ${pageTextMap.size} pages written`,
      );
    },
  }),
);
