import { createTable } from "#src/services/shared/overlay/createTable";
import { threadFollowsInMessage } from "@esposter/db-schema";

// The thread follows the overlay holds, one slot each, a follow keyed by its room, thread root and member
export const threadFollowTable = createTable(threadFollowsInMessage);
