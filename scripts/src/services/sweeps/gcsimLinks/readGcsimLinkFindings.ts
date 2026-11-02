import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CLAUDE_PATHSPEC_EXCLUDE } from "#src/services/sweeps/constants";
import { getGcsimLinks } from "#src/services/sweeps/gcsimLinks/getGcsimLinks";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// An archived change is history nothing rewrites, so its links are not this scan's to answer for
const EXCLUDED_PATHSPECS = [CLAUDE_PATHSPEC_EXCLUDE, ":(exclude)openspec/changes/archive"];
// Every tracked file's links into gcsim's tree at a ref other than the kits' tag, one `path:line: link` each
export const readGcsimLinkFindings = (): string[] =>
  readSweepFilePaths(...EXCLUDED_PATHSPECS).flatMap((path) =>
    readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")
      .split("\n")
      .flatMap((line, index) => getGcsimLinks(line).map((link) => `${path}:${index + 1}: ${link}`)),
  );
