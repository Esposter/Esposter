import type { UserStatusInMessage } from "@esposter/db-schema";
import type { Except, SetNonNullable } from "type-fest";

export type StoredUserStatus = SetNonNullable<Except<UserStatusInMessage, "userId">, "status">;
