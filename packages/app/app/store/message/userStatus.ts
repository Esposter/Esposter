import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { Except, SetNonNullable } from "type-fest";

import { UserStatus } from "#shared/models/db/user/UserStatus";

export const useUserStatusStore = defineStore("message/userStatus", () => {
  const userStatusMap = ref(new Map<string, SetNonNullable<Except<IUserStatus, "userId">, "status">>());
  const getUserStatusEnum = (id: string) => userStatusMap.value.get(id)?.status ?? UserStatus.Online;
  return { getUserStatusEnum, userStatusMap };
});
