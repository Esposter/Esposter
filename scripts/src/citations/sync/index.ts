import { readCitingPaths } from "#src/services/citations/readCitingPaths";
import { getRenamePrefixes } from "#src/services/citations/sync/getRenamePrefixes";
import { rewriteCitations } from "#src/services/citations/sync/rewriteCitations";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { defineCommand, runMain } from "citty";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

await runMain(
  defineCommand({
    args: {
      // The renames are read against `HEAD` by default, which is where a `git mv` shows; a base of `HEAD~1` reads a
      // Move already committed on its own, which is how a sweep commits its moves apart from their repairs
      base: {
        default: "HEAD",
        description: "The revision the renames are read against",
        required: false,
        type: "positional",
      },
    },
    meta: { description: "Rewrite every citation of a renamed path to its new one", name: "ai:citations:sync" },
    run: ({ args }) => {
      const renames = getRenamePrefixes(runGit(["diff", "--name-status", "-M", args.base]));
      // Nothing to rewrite means no page to read: the pages are only opened once there is a rename to apply to them
      if (renames.length === 0) {
        console.info(`no renames since ${args.base}`);
        return;
      }

      for (const citingPath of readCitingPaths()) {
        const absolutePath = resolve(REPOSITORY_ROOT, citingPath);
        const text = readFileSync(absolutePath, "utf8");
        const rewritten = rewriteCitations(text, renames);
        if (rewritten === text) continue;

        writeFileSync(absolutePath, rewritten);
        console.info(citingPath);
      }
    },
  }),
);
