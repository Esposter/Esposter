import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";

// The id of the node holding a slot, or the empty id when the slot is the page's own content
export const getSlotOwnerId = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument | undefined,
  slotPointer: string,
): string => getNodeIdAt(kind, document, getSlotOwnerPointer(slotPointer));
