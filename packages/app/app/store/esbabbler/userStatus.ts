import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { Except } from "type-fest";

export const useUserStatusStore = defineStore("esbabbler/userStatus", () => {
  const userStatusMap = ref(new Map<string, Except<IUserStatus, "userId">>());
  return { userStatusMap };
});
