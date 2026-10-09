import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { parseKeyFilePaths } from "#src/services/fleet/parseKeyFilePaths";
import { parseProposalFrontmatter } from "#src/services/fleet/parseProposalFrontmatter";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MARKDOWN_EXTENSION_REGEX = /\.md$/u;

// Each open proposal unit as an entry: its area is the folder it lives in, its id the path under the proposals folder
// With its separators doubled. Its touch set is the paths its Key files table names plus the globs its frontmatter adds,
// And its needs and waiting are the frontmatter's own, empty when the page names none
export const readProposalEntries = (): FleetEntry[] =>
  readProposalSummaries().map(({ path }) => {
    const relativePath = path.slice(PROPOSALS_DIRECTORY.length + 1).replace(MARKDOWN_EXTENSION_REGEX, "");
    const [area = ""] = relativePath.split("/");
    const text = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
    const { needs, touches, waiting } = parseProposalFrontmatter(text);
    return {
      area,
      id: relativePath.replaceAll("/", "--"),
      kind: FleetEntryKind.Unit,
      lane: "",
      needs,
      touches: [...parseKeyFilePaths(text), ...touches],
      waiting,
    };
  });
