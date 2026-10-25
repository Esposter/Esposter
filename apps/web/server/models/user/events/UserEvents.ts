import type { UserStatusInMessage } from "@esposter/db-schema";
import type { SetNonNullable } from "type-fest";

export interface UserEvents {
  upsertStatus: [SetNonNullable<UserStatusInMessage, "status">];
}
