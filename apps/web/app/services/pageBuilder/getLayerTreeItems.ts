import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { UiTreeItem } from "@/models/ui/UiTreeItem";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The layers tree's items: each row is a child of the nearest earlier row one depth up, labelled by its type's title.
// A row whose node or title cannot be read is skipped
export const getLayerTreeItems = (document: WebpageDocument): UiTreeItem[] => {
  const roots: UiTreeItem[] = [];
  // The open ancestors of the row being placed, the deepest last
  const ancestors: { depth: number; item: UiTreeItem }[] = [];
  for (const row of getBlockLayerRows(document, webpageRegistry)) {
    const node = getBlockNode(document, row.nodePointer);
    // A row's type is a string the document holds, so its title is looked up only for a type the enum names
    const nodeType = Object.values(WebpageNodeType).find((type) => type === row.type);
    const id = node?.props.id;
    if (typeof id !== "string" || !nodeType) continue;

    const item: UiTreeItem = { children: [], id, title: WEBPAGE_NODE_TYPE_TITLE_MAP[nodeType] };
    while ((ancestors.at(-1)?.depth ?? -1) >= row.depth) ancestors.pop();
    (ancestors.at(-1)?.item.children ?? roots).push(item);
    ancestors.push({ depth: row.depth, item });
  }
  return roots;
};
