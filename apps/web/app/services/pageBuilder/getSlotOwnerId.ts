import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";

// The id of the node holding a slot, or the empty id when the slot is the page's own content
export const getSlotOwnerId = (
  kind: PageBuilderKind,
  document: undefined | WebpageDocument,
  slotPointer: string,
): string => getNodeIdAt(kind, document, getSlotOwnerPointer(slotPointer));
