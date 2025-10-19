import type { IUserStatus } from "@esposter/db-schema";
import type { Except, SetNonNullable } from "type-fest";

import { UserStatus } from "@esposter/db-schema";

export const useStatusStore = defineStore("message/user/status", () => {
  const statusMap = ref(new Map<string, SetNonNullable<Except<IUserStatus, "userId">, "status">>());
  const getStatusEnum = (id: string) => statusMap.value.get(id)?.status ?? UserStatus.Online;
  return { getStatusEnum, statusMap };
});
