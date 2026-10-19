import type { BlockDocument } from "headless-block-editor";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it
export const getNodePointer = (document: BlockDocument, nodeId: string) =>
  getBlockLayerRows(document, webpageRegistry)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getBlockNode(document, nodePointer)?.props.id === nodeId);
