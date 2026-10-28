import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { parseArrayIndex, readJsonValue, toJsonPointer } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// A node's title, suffixed by its 1-based position among its siblings of the same type when there is more than one such
// Sibling, so a path can tell "Column 1" from "Column 2" in the same slot. Empty when the node is not of a known type
export const getNodeTitle: PageBuilderHelper<string, [nodeSegments: string[]]> = (kind, document, nodeSegments) => {
  const node = getBlockNode(document, toJsonPointer(nodeSegments), kind.children);
  const nodeType = node?.type;
  const index = parseArrayIndex(nodeSegments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  const parentSegments = nodeSegments.slice(0, -1);
  const siblings = readJsonValue(document, parentSegments);
  if (!nodeType || index === undefined || !Array.isArray(siblings)) return "";

  const siblingTypes = siblings.map(
    (_value, siblingIndex) =>
      getBlockNode(document, toJsonPointer([...parentSegments, String(siblingIndex)]), kind.children)?.type,
  );
  const sameTypeCount = siblingTypes.filter((type) => type === nodeType).length;
  const title = kind.titles[nodeType] ?? "";
  if (!title || sameTypeCount <= 1) return title;

  const position = siblingTypes.slice(0, index + 1).filter((type) => type === nodeType).length;
  return `${title} ${position}`;
};
