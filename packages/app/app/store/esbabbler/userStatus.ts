import type { IUserStatus } from "#shared/db/schema/userStatuses";

export const useUserStatusStore = defineStore("esbabbler/userStatus", () => {
  const userStatusMap = ref(new Map<string, IUserStatus["status"]>());
  return { userStatusMap };
});
