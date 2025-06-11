import type { IUserStatus } from "#shared/db/schema/userStatuses";

import { EventEmitter } from "node:events";

interface UserEvents {
  updateStatus: IUserStatus[];
}

export const userEventEmitter = new EventEmitter<UserEvents>();
