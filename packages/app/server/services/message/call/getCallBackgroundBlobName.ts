import type { User } from "@esposter/db-schema";

import { getCallBackgroundPrefix } from "@@/server/services/message/call/getCallBackgroundPrefix";

// The one place a call background's blob name is spelled. The slot index *is* the name, so the number of
// Backgrounds a user can hold is bounded by construction rather than by a count anything has to enforce, and
// Re-uploading a slot overwrites it. Nothing allocates an id, so there is no row to reconcile with storage
export const getCallBackgroundBlobName = (userId: User["id"], slot: number) =>
  `${getCallBackgroundPrefix(userId)}${slot}`;
