import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { UNIT_ID_SEPARATOR } from "#src/services/fleet/constants";
import { parseKeyFilePaths } from "#src/services/fleet/parseKeyFilePaths";
import { parseProposalFrontmatter } from "#src/services/fleet/parseProposalFrontmatter";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";

const MARKDOWN_EXTENSION_REGEX = /\.md$/u;

// Each open proposal unit as an entry: its area is the folder it lives in, its id the path under the proposals folder
// With its separators doubled. Its touch set is the paths its Key files table names plus the globs its frontmatter adds,
// And its needs and waiting are the frontmatter's own, empty when the page names none
export const readProposalEntries = (files: readonly QueueFile[]): FleetEntry[] => {
  const pathTextMap = new Map(files.map(({ path, text }) => [path, text]));
  return readProposalSummaries(files).map(({ path }) => {
    const relativePath = path.slice(PROPOSALS_DIRECTORY.length + 1).replace(MARKDOWN_EXTENSION_REGEX, "");
    const [area = ""] = relativePath.split("/");
    const text = pathTextMap.get(path) ?? "";
    const { needs, touches, waiting } = parseProposalFrontmatter(text);
    return {
      area,
      id: relativePath.replaceAll("/", UNIT_ID_SEPARATOR),
      kind: FleetEntryKind.Unit,
      lane: "",
      line: "",
      needs,
      touches: [...parseKeyFilePaths(text), ...touches],
      waiting,
    };
  });
};
