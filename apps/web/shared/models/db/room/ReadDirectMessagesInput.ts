import type { PageSort, RoomInMessage } from "@esposter/db-schema";
import type { z } from "zod";

import { createPageInputSchema, SortOrder } from "@esposter/db-schema";

// The latest message first, and a tie on it by the larger id first, so a page boundary never falls between two rooms the
// Order cannot tell apart
export const DIRECT_MESSAGE_SORT = { keys: ["lastMessageAt", "id"], order: SortOrder.Desc } as const satisfies PageSort<
  keyof RoomInMessage
>;
export const readDirectMessagesInputSchema = createPageInputSchema(DIRECT_MESSAGE_SORT).prefault({});
export type ReadDirectMessagesInput = z.infer<typeof readDirectMessagesInputSchema>;
