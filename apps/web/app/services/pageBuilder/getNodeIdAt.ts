import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getBlockNode } from "headless-block-editor";

// The id of the node at the pointer, or the empty id when the pointer names no node
export const getNodeIdAt: PageBuilderHelper<string, [nodePointer: string]> = (kind, document, nodePointer) =>
  getBlockNode(document, nodePointer, kind.children)?.props.id ?? "";
