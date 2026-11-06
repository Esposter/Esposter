import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument } from "vue-block-editor-headless";

import { applyPatches } from "@esposter/shared";

// The operations of several items as one list. Each item's operations are read from the document the items before it leave,
// So an item that removes or adds an element names the indexes the earlier items have already shifted
export const getChainedOperations = <TItem>(
  document: PositionedDocument,
  items: TItem[],
  getOperations: (document: PositionedDocument, item: TItem) => JsonPatchOperation[],
): JsonPatchOperation[] => {
  const operations: JsonPatchOperation[] = [];
  let chainedDocument = document;
  for (const item of items) {
    const itemOperations = getOperations(chainedDocument, item);
    chainedDocument = applyPatches(chainedDocument, itemOperations).document;
    operations.push(...itemOperations);
  }
  return operations;
};
