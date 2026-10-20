import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getBlockLayerRows } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it
export const getNodePointer = (document: WebpageDocument, nodeId: string) =>
  getBlockLayerRows(document, webpageNodeChildren)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getNodeIdAt(document, nodePointer) === nodeId);
