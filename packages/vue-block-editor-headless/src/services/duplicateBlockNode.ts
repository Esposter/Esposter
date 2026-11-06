import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { JsonPatchOperation } from "@esposter/shared";
import type { z } from "zod";

import { getBlockNode } from "#src/services/getBlockNode";
import { pasteBlockNodes } from "#src/services/pasteBlockNodes";
import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// Pastes a copy of the node into its own slot straight after it, so the copy and every node in its slots get fresh ids
// No operations for a pointer naming no node
export const duplicateBlockNode = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  registry: BlockRegistry<TNode>,
  children: BlockChildren<TNode>,
  nodeSchema: z.ZodType<TNode>,
  nodePointer: string,
): JsonPatchOperation[] => {
  const node = getBlockNode(document, nodePointer, children);
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (!node || index === undefined) return [];

  return pasteBlockNodes(
    document,
    registry,
    children,
    nodeSchema,
    [node],
    toJsonPointer(segments.slice(0, -1)),
    index + 1,
  );
};
