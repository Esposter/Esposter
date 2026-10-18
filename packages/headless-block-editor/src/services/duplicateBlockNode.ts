import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";

import { getBlockNode } from "#src/services/getBlockNode";
import { pasteBlockNodes } from "#src/services/pasteBlockNodes";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// Pastes a copy of the node into its own slot straight after it, so the copy and every node in its slots get fresh ids
// No operations for a pointer naming no node
export const duplicateBlockNode = (
  document: BlockDocument,
  registry: BlockRegistry,
  nodePointer: string,
): JsonPatchOperation[] => {
  const node = getBlockNode(document, nodePointer);
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (!node || index === undefined) return [];

  return pasteBlockNodes(document, registry, [node], toJsonPointer(segments.slice(0, -1)), index + 1);
};
