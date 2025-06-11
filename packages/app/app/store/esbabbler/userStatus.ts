import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { Except, SetNonNullable } from "type-fest";

export const useUserStatusStore = defineStore("esbabbler/userStatus", () => {
  const userStatusMap = ref(new Map<string, SetNonNullable<Except<IUserStatus, "userId">, "status">>());
  return { userStatusMap };
});
