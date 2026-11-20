import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getNodeTitle } from "#src/services/pageBuilder/getNodeTitle";
import { getSlotOwnerPointer } from "#src/services/pageBuilder/getSlotOwnerPointer";
import { parseJsonPointer } from "@esposter/shared";

// The path a slot is named by in Move to: "The page" for the root's content, otherwise the titles of the nodes from the
// Root down to the slot's owning node, joined with " › "
export const getSlotPath: PageBuilderHelper<string, [slotPointer: string]> = (kind, document, slotPointer) => {
  if (slotPointer === "/content") return "The page";
  // Each node on the way down is three segments after the one before it
  const ownerSegments = parseJsonPointer(getSlotOwnerPointer(slotPointer));
  const titles: string[] = [];
  for (let length = 2; length <= ownerSegments.length; length += 3)
    titles.push(getNodeTitle(kind, document, ownerSegments.slice(0, length)));
  return titles.join(" › ");
};
