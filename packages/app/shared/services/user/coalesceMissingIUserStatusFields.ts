import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { OnUpsertUserStatus } from "#shared/models/db/user/OnUpsertUserStatus";
import type { RequiredUserStatusFields } from "#shared/models/db/user/RequiredUserStatusFields";
import type { Except } from "type-fest";

export const coalesceMissingIUserStatusFields = (
  onUpsertUserStatus?: Except<OnUpsertUserStatus, RequiredUserStatusFields>,
): Except<IUserStatus, RequiredUserStatusFields> => ({
  expiresAt: onUpsertUserStatus.expiresAt ?? null,
  lastActiveAt: onUpsertUserStatus.lastActiveAt ?? new Date(),
  message: onUpsertUserStatus.message ?? "",
});
