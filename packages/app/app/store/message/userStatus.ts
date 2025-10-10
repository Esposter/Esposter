import type { IUserStatus } from "@esposter/db-schema";
import type { Except, SetNonNullable } from "type-fest";

import { UserStatus } from "@esposter/db-schema";

export const useUserStatusStore = defineStore("message/userStatus", () => {
  const userStatusMap = ref(new Map<string, SetNonNullable<Except<IUserStatus, "userId">, "status">>());
  const getUserStatusEnum = (id: string) => userStatusMap.value.get(id)?.status ?? UserStatus.Online;
  return { getUserStatusEnum, userStatusMap };
});
