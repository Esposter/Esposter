import type { UserStatusInMessage } from "@esposter/db-schema";
import type { Except, SetNonNullable } from "type-fest";

// The row minus the id it is keyed by. `status` is non-null because a row only exists once one was set — the
// Absent case is the status store's default, never a stored null
export type StoredUserStatus = SetNonNullable<Except<UserStatusInMessage, "userId">, "status">;
