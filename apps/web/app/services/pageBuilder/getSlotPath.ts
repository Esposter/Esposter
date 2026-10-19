import type { BlockDocument } from "headless-block-editor";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { parseArrayIndex, parseJsonPointer, readJsonValue, toJsonPointer } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// A node's title, suffixed by its 1-based position among its siblings of the same type when there is more than one such
// Sibling, so a path can tell "Column 1" from "Column 2" in the same slot
const getNodeTitle = (document: BlockDocument, nodeSegments: string[]): string => {
  const node = getBlockNode(document, toJsonPointer(nodeSegments));
  const nodeType = Object.values(WebpageNodeType).find((type) => type === node?.type);
  const index = parseArrayIndex(nodeSegments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  const siblings = readJsonValue(document, nodeSegments.slice(0, -1));
  if (!nodeType || index === undefined || !Array.isArray(siblings)) return "";

  const parentSegments = nodeSegments.slice(0, -1);
  const siblingTypes = siblings.map(
    (_, siblingIndex) => getBlockNode(document, toJsonPointer([...parentSegments, String(siblingIndex)]))?.type,
  );
  const sameTypeCount = siblingTypes.filter((type) => type === nodeType).length;
  const title = WEBPAGE_NODE_TYPE_TITLE_MAP[nodeType];
  if (sameTypeCount <= 1) return title;

  const position = siblingTypes.slice(0, index + 1).filter((type) => type === nodeType).length;
  return `${title} ${position}`;
};

// The path a slot is named by in Move to: "The page" for the root's content, otherwise the titles of the nodes from the
// Root down to the slot's owning node, joined with " › "
export const getSlotPath = (document: BlockDocument, slotPointer: string): string => {
  if (slotPointer === "/content") return "The page";

  // A node's pointer is its slot's pointer plus one index, so the owning node sits two segments before the slot
  // And each node on the way down is three segments after the one before it
  const ownerSegments = parseJsonPointer(slotPointer).slice(0, -2);
  const titles: string[] = [];
  for (let length = 2; length <= ownerSegments.length; length += 3)
    titles.push(getNodeTitle(document, ownerSegments.slice(0, length)));
  return titles.join(" › ");
};
