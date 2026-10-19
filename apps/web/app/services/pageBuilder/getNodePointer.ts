import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it
export const getNodePointer = (document: WebpageDocument, nodeId: string) =>
  getBlockLayerRows(document, webpageRegistry)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getBlockNode(document, nodePointer)?.props.id === nodeId);
