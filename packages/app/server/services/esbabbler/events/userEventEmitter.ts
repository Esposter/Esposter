import type { OnUpsertUserStatus } from "#shared/models/db/user/OnUpsertUserStatus";

import { EventEmitter } from "node:events";

interface UserEvents {
  upsertStatus: OnUpsertUserStatus[];
}

export const userEventEmitter = new EventEmitter<UserEvents>();
