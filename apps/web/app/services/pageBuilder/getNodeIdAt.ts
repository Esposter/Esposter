import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getBlockNode } from "headless-block-editor";

// The id of the node at the pointer, or the empty id when the pointer names no node
export const getNodeIdAt = (document: WebpageDocument, nodePointer: string): string =>
  getBlockNode(document, nodePointer)?.props.id ?? "";
