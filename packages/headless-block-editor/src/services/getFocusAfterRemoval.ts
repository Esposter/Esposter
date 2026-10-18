import type { BlockDocument } from "#src/models/BlockDocument";

import { getResult, parseArrayIndex, parseJsonPointer, readJsonValue, toJsonPointer } from "@esposter/shared";

// The node that takes focus when the node at a pointer is removed: its next sibling, which moves into its index
// Otherwise its previous sibling, else its parent, with the root named by the empty pointer
export const getFocusAfterRemoval = (document: BlockDocument, nodePointer: string): string => {
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  const siblings: unknown = getResult(() => readJsonValue(document, segments.slice(0, -1))).match(
    (value) => value,
    () => undefined,
  );
  if (index === undefined || !Array.isArray(siblings)) return "";

  const slotPointer = toJsonPointer(segments.slice(0, -1));
  if (index + 1 < siblings.length) return `${slotPointer}/${index}`;
  else if (index > 0) return `${slotPointer}/${index - 1}`;
  return toJsonPointer(segments.slice(0, -3));
};
