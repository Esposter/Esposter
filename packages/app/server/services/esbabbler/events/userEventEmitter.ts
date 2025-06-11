import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { SetNonNullable } from "type-fest";

import { EventEmitter } from "node:events";

interface UserEvents {
  updateStatus: SetNonNullable<IUserStatus, "status">[];
}

export const userEventEmitter = new EventEmitter<UserEvents>();
