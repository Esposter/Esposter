import { readCitingPaths } from "#src/services/citations/readCitingPaths";
import { getRenamePrefixes } from "#src/services/citations/sync/getRenamePrefixes";
import { rewriteCitations } from "#src/services/citations/sync/rewriteCitations";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The renames are read against `HEAD` by default, which is where a `git mv` shows; a base of `HEAD~1` reads a
// Move already committed on its own, which is how a sweep commits its moves apart from their repairs
const base = process.argv[2] ?? "HEAD";

const renames = getRenamePrefixes(
  execFileSync("git", ["diff", "--name-status", "-M", base], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    env: getGitEnv(),
  }),
);
// Nothing to rewrite means no page to read: the pages are only opened once there is a rename to apply to them
if (renames.length === 0) console.info(`no renames since ${base}`);
else
  for (const citingPath of readCitingPaths()) {
    const absolutePath = resolve(REPOSITORY_ROOT, citingPath);
    const text = readFileSync(absolutePath, "utf8");
    const rewritten = rewriteCitations(text, renames);
    if (rewritten === text) continue;

    writeFileSync(absolutePath, rewritten);
    console.info(citingPath);
  }
