import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { parseJsonPointer } from "@esposter/shared";

// The path a slot is named by in Move to: "The page" for the root's content, otherwise the titles of the nodes from the
// Root down to the slot's owning node, joined with " › "
export const getSlotPath: PageBuilderHelper<string, [slotPointer: string]> = (kind, document, slotPointer) => {
  if (slotPointer === "/content") return "The page";
  // A node's pointer is its slot's pointer plus one index, so the owning node sits two segments before the slot
  // And each node on the way down is three segments after the one before it
  const ownerSegments = parseJsonPointer(slotPointer).slice(0, -2);
  const titles: string[] = [];
  for (let length = 2; length <= ownerSegments.length; length += 3)
    titles.push(getNodeTitle(kind, document, ownerSegments.slice(0, length)));
  return titles.join(" › ");
};
