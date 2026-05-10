import type { AppUserInMessage } from "@esposter/db-schema";

export const useAppUserStore = defineStore("message/user/appUser", () => {
  const appUserMap = ref(new Map<string, AppUserInMessage>());
  return {
    appUserMap,
  };
});
