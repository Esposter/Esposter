import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { RequiredUserStatusFields } from "#shared/models/db/user/RequiredUserStatusFields";
import type { Except, SetNonNullable } from "type-fest";

export type OnUpsertUserStatus = Partial<Except<IUserStatus, RequiredUserStatusFields>> &
  SetNonNullable<Pick<IUserStatus, RequiredUserStatusFields>, "status">;
