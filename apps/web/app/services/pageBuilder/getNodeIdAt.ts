import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { getBlockNode } from "headless-block-editor";

// The id of the node at the pointer, or the empty id when there is no document or the pointer names no node
export const getNodeIdAt = (document: undefined | WebpageDocument, nodePointer: string): string =>
  document ? (getBlockNode(document, nodePointer, webpageNodeChildren)?.props.id ?? "") : "";
