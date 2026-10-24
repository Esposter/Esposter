import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getBlockLayerRows } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it. Generic over the kind, so a
// Webpage and an email are looked up the same way
export const getNodePointer: PageBuilderHelper<string | undefined, [nodeId: string]> = (kind, document, nodeId) =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getNodeIdAt(kind, document, nodePointer) === nodeId);
