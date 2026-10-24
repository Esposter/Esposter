import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getBlockLayerRows } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it
export const getNodePointer = (kind: PageBuilderKind, document: WebpageDocument, nodeId: string) =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getNodeIdAt(kind, document, nodePointer) === nodeId);
