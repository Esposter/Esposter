import { CHANGELOG_REGEX, DATED_PROSE_SKIPPED_PREFIXES } from "#src/services/openspec/constants";
import { findDatedProseLines } from "#src/services/openspec/findDatedProseLines";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every tracked Markdown doc's lines that say a date in prose, one `path:line` each. A doc states its present shape and
// History is git's, so a dated line is a finding wherever it sits, read from the working tree like the spec scans.
export const readDatedProse = (): string[] =>
  readSweepFilePaths("*.md")
    .filter(
      (path) => !CHANGELOG_REGEX.test(path) && !DATED_PROSE_SKIPPED_PREFIXES.some((prefix) => path.startsWith(prefix)),
    )
    .flatMap((path) =>
      findDatedProseLines(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")).map((line) => `${path}:${line}`),
    );
