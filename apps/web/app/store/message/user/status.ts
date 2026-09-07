import type { UserStatusInMessage } from "@esposter/db-schema";
import type { Except, SetNonNullable } from "type-fest";

import { UserStatus } from "@esposter/db-schema";

// The row minus the id it is keyed by. `status` is non-null because a row only exists once one was set —
// The absent case is the default below, never a stored null
type StoredUserStatus = SetNonNullable<Except<UserStatusInMessage, "userId">, "status">;

export const useStatusStore = defineStore("message/user/status", () => {
  const statusMap = ref(new Map<string, StoredUserStatus>());
  const getStoredUserStatus = (id: string) => statusMap.value.get(id);
  const getUserStatus = (id: string) => getStoredUserStatus(id)?.status ?? UserStatus.Online;
  const getStatusMessage = (id: string) => getStoredUserStatus(id)?.message ?? "";
  const storeStatus = (userId: string, userStatus: StoredUserStatus) => {
    statusMap.value.set(userId, userStatus);
  };
  const storeStatuses = (userStatuses: (Pick<UserStatusInMessage, "userId"> & StoredUserStatus)[]) => {
    for (const { userId, ...userStatus } of userStatuses) storeStatus(userId, userStatus);
  };
  return { getStatusMessage, getStoredUserStatus, getUserStatus, statusMap, storeStatus, storeStatuses };
});
