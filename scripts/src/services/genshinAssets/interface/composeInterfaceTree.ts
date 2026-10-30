import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";
import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { orderInterfaceChildren } from "#src/services/genshinAssets/interface/orderInterfaceChildren";

// A screen's interface as a tree from one of its container's entries down: each piece's children are the entries whose
// Father it is, in the order its Transform lists them, and a piece with no Transform dump has none. The tree stops
// `depth` levels below its root, every level unless told
export const composeInterfaceTree = (
  entries: readonly UiIndexEntry[],
  root: UiIndexEntry,
  // oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands this annotation
  depth: number = Infinity,
): InterfaceNode => {
  const childrenByFatherId = Map.groupBy(entries, ({ fatherId }) => fatherId);
  const toNode = (entry: UiIndexEntry, remainingDepth: number): InterfaceNode => {
    const children =
      remainingDepth > 0 && entry.transformId
        ? orderInterfaceChildren(childrenByFatherId.get(entry.transformId) ?? [], entry.childIds).map((child) =>
            toNode(child, remainingDepth - 1),
          )
        : [];
    return {
      ...entry.rect,
      ...(entry.canvas ? { canvas: entry.canvas } : {}),
      children,
      components: entry.components,
      name: entry.name,
      path: [...entry.path, entry.name].join("/"),
      scale: entry.scale,
    };
  };
  return toNode(root, depth);
};
