import {
  ADDRESS_REGEX,
  CHANGELOG_REGEX,
  DATED_PROSE_REGEX,
  DATED_PROSE_SKIPPED_PREFIXES,
} from "#src/services/openspec/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every tracked Markdown doc's lines that state a date outside a URL, one `path:line` each. A doc states its present
// Shape and history is git's, so a dated line is a finding wherever it sits, read from the working tree like the spec scans.
export const readDatedProse = (): string[] =>
  readSweepFilePaths("*.md")
    .filter(
      (path) => !CHANGELOG_REGEX.test(path) && !DATED_PROSE_SKIPPED_PREFIXES.some((prefix) => path.startsWith(prefix)),
    )
    .flatMap((path) =>
      readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")
        .split(/\r?\n/u)
        .flatMap((text, index) =>
          DATED_PROSE_REGEX.test(text.replaceAll(ADDRESS_REGEX, "")) ? [`${path}:${index + 1}`] : [],
        ),
    );
