import type { BlockDocument } from "headless-block-editor";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The pointer of the node carrying an id, or undefined when no node does. A node's pointer changes when it moves, its id does not
export const getNodePointerById = (document: BlockDocument, id: string): string | undefined =>
  getBlockLayerRows(document, webpageRegistry).find(
    ({ nodePointer }) => getBlockNode(document, nodePointer)?.props.id === id,
  )?.nodePointer;
