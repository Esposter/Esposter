import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { UiTreeItem } from "@/models/ui/UiTreeItem";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The layers tree's items: each row is a child of the nearest earlier row one depth up, labelled by its type's title.
// A row whose node or title cannot be read is skipped
export const getLayerTreeItems = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
): UiTreeItem[] => {
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
