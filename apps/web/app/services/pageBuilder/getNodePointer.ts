import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "#src/services/pageBuilder/getNodeIdAt";
import { getBlockLayerRows } from "vue-block-editor-headless";

// The pointer of the node an id names, or none when no node in the document holds it. Generic over the kind, so a
// Webpage and an email are looked up the same way
export const getNodePointer: PageBuilderHelper<string | undefined, [nodeId: string]> = (kind, document, nodeId) =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getNodeIdAt(kind, document, nodePointer) === nodeId);
