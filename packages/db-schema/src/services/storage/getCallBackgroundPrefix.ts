import type { UserInAuth } from "#src/schema/auth/usersInAuth";

import { DatabaseEntityType } from "#src/models/shared/DatabaseEntityType";

// Every one of a user's call backgrounds lives under this one prefix, so the listing that renders the picker
// And the sweep that reclaims a slot name the same set without either holding a list of its own
export const getCallBackgroundPrefix = (userId: UserInAuth["id"]) => `${userId}/${DatabaseEntityType.CallBackground}/`;
