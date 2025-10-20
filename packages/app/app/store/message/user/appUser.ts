import type { AppUser } from "@esposter/db-schema";

export const useAppUserStore = defineStore("message/user/appUser", () => {
  const appUserMap = ref(new Map<string, AppUser>());
  return {
    appUserMap,
  };
});
