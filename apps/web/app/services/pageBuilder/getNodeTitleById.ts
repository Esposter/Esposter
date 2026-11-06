import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getBlockNode } from "headless-block-editor";

// The title a node is listed under: its block type's title, or the id itself when no node in the document holds it or its type
// Has no title, so a finding that names a node the document no longer holds still reads as something
export const getNodeTitleById: PageBuilderHelper<string, [nodeId: string]> = (kind, document, nodeId) => {
  const nodePointer = getNodePointer(kind, document, nodeId);
  const node = nodePointer === undefined ? undefined : getBlockNode(document, nodePointer, kind.children);
  return (node && kind.titles[node.type]) || nodeId;
};
