import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";

// The id of the node holding a slot, or the empty id when the slot is the page's own content
export const getSlotOwnerId: PageBuilderHelper<string, [slotPointer: string]> = (kind, document, slotPointer) =>
  getNodeIdAt(kind, document, getSlotOwnerPointer(slotPointer));
