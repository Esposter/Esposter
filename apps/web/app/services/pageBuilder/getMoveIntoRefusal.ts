import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { FIRST_IN_SLOT_MESSAGE } from "@/services/pageBuilder/constants";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import { moveIntoPreviousSibling } from "headless-block-editor";

// Why a node cannot move into the block before it, or none when it can. The same operations decide it: the first node of a
// Slot has no block before it, and otherwise the block before it has no slot that takes a node of the node's type
export const getMoveIntoRefusal: PageBuilderHelper<string | undefined, [nodePointer: string]> = (
  kind,
  document,
  nodePointer,
) => {
  if (moveIntoPreviousSibling(document, kind.registry, kind.children, nodePointer).length > 0) return undefined;

  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === 0) return FIRST_IN_SLOT_MESSAGE;

  return `The block before it takes no ${getNodeTitle(kind, document, segments)}`;
};
