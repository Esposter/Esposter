import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";
import type { UiTreeItem } from "@/models/ui/UiTreeItem";

import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The layers tree's items: each row is a child of the nearest earlier row one depth up, labelled by its type's title.
// A row whose node or title cannot be read is skipped
export const getLayerTreeItems: PageBuilderHelper<UiTreeItem[], []> = (kind, document) => {
  const roots: UiTreeItem[] = [];
  // The open ancestors of the row being placed, the deepest last
  const ancestors: { depth: number; item: UiTreeItem }[] = [];
  for (const row of getBlockLayerRows(document, kind.children)) {
    const node = getBlockNode(document, row.nodePointer, kind.children);
    // A row whose type has no title is one the kind does not draw, so it is skipped with its subtree left in place
    const id = node?.props.id;
    const title = kind.titles[row.type];
    if (typeof id !== "string" || title === undefined) continue;

    const item: UiTreeItem = { children: [], id, title };
    while ((ancestors.at(-1)?.depth ?? -1) >= row.depth) ancestors.pop();
    (ancestors.at(-1)?.item.children ?? roots).push(item);
    ancestors.push({ depth: row.depth, item });
  }
  return roots;
};
