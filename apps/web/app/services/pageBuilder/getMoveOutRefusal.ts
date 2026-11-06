import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { TOP_LEVEL_MESSAGE } from "@/services/pageBuilder/constants";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import { moveOutAfterParent } from "headless-block-editor";

// Why a node cannot move out after its parent, or none when it can. The same operations decide it: a node in the page's own
// Content has no parent to move out of, and otherwise the slot that holds the parent takes no node of the node's type
export const getMoveOutRefusal: PageBuilderHelper<string | undefined, [nodePointer: string]> = (
  kind,
  document,
  nodePointer,
) => {
  if (moveOutAfterParent(document, kind.registry, kind.children, nodePointer).length > 0) return undefined;

  const segments = parseJsonPointer(nodePointer);
  const parentIndex = parseArrayIndex(segments.at(-4) ?? "", Number.MAX_SAFE_INTEGER);
  if (parentIndex === undefined) return TOP_LEVEL_MESSAGE;

  return `Its parent's slot takes no ${getNodeTitle(kind, document, segments)}`;
};
