import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { parseArrayIndex, readJsonValue, toJsonPointer } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// A node's title, suffixed by its 1-based position among its siblings of the same type when there is more than one such
// Sibling, so a path can tell "Column 1" from "Column 2" in the same slot. Empty when the node is not of a known type
export const getNodeTitle = (document: WebpageDocument, nodeSegments: string[]): string => {
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
