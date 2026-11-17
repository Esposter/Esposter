import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getNodeSlotPointer } from "#src/services/pageBuilder/getNodeSlotPointer";
import { getNodeTitle } from "#src/services/pageBuilder/getNodeTitle";
import { getSlotPath } from "#src/services/pageBuilder/getSlotPath";
import { parseArrayIndex, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The announcement of a node that has just moved: its title, its 1-based position among its slot's children and the slot's
// Path. Empty when the node has no title or no position in a slot
export const getMoveAnnouncement: PageBuilderHelper<string, [nodePointer: string]> = (kind, document, nodePointer) => {
  const segments = parseJsonPointer(nodePointer);
  const siblings = readJsonValue(document, segments.slice(0, -1));
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  const title = getNodeTitle(kind, document, segments);
  if (!title || !Array.isArray(siblings) || index === undefined) return "";

  const path = getSlotPath(kind, document, getNodeSlotPointer(nodePointer));
  return `Moved ${title} to position ${index + 1} of ${siblings.length} in ${path}`;
};
