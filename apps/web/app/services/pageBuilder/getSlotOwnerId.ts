import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "#src/services/pageBuilder/getNodeIdAt";
import { getSlotOwnerPointer } from "#src/services/pageBuilder/getSlotOwnerPointer";

// The id of the node holding a slot, or the empty id when the slot is the page's own content
export const getSlotOwnerId: PageBuilderHelper<string, [slotPointer: string]> = (kind, document, slotPointer) =>
  getNodeIdAt(kind, document, getSlotOwnerPointer(slotPointer));
