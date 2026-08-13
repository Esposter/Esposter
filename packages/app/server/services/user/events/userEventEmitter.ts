import type { UserStatusInMessage } from "@esposter/db-schema";
import type { SetNonNullable } from "type-fest";

import { EventEmitter } from "node:events";

interface UserEvents {
  upsertStatus: [SetNonNullable<UserStatusInMessage, "status">];
}

export const userEventEmitter = new EventEmitter<UserEvents>();
