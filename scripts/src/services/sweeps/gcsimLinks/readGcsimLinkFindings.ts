import { GCSIM_REPOSITORY_URL, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CLAUDE_PATHSPEC_EXCLUDE } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// A link into gcsim's tree at any ref but the tag the kits are read at, whose later refs are under gcsim's own licence
const GCSIM_LINK_REGEX = new RegExp(
  String.raw`${RegExp.escape(GCSIM_REPOSITORY_URL)}/(?:blob|tree)/(?!${RegExp.escape(GCSIM_TAG)}/)[^/\s]+`,
  "gu",
);
// An archived change is history nothing rewrites, so its links are not this scan's to answer for
const EXCLUDED_PATHSPECS = [CLAUDE_PATHSPEC_EXCLUDE, ":(exclude)openspec/changes/archive"];
// Every tracked file's links into gcsim's tree at a ref other than the kits' tag, one `path:line: link` each
export const readGcsimLinkFindings = (): string[] =>
  readSweepFilePaths(...EXCLUDED_PATHSPECS).flatMap((path) =>
    readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")
      .split("\n")
      .flatMap((line, index) =>
        Array.from(line.matchAll(GCSIM_LINK_REGEX), ([link]) => `${path}:${index + 1}: ${link}`),
      ),
  );
