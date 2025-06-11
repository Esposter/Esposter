import type { User } from "#shared/db/schema/users";
import type { IUserStatus } from "#shared/db/schema/userStatuses";

import { EventEmitter } from "node:events";

interface UserEvents {
  updateStatus: (Partial<Pick<IUserStatus, "status">> & Pick<User, "id">)[];
}

export const userEventEmitter = new EventEmitter<UserEvents>();
