import type { AppUserInMessage } from "@esposter/db-schema";

// The bot identities a webhook posts as, cached across the rooms one blade session visits — the same shape
// `useUserStore` gives a person, and written through the same kind of setter so no surface reaches into the map
export const useAppUserStore = defineStore("message/user/appUser", () => {
  const appUserMap = ref(new Map<string, AppUserInMessage>());
  const storeAppUser = (appUser: AppUserInMessage) => {
    appUserMap.value.set(appUser.id, appUser);
  };
  const storeAppUsers = (appUsers: AppUserInMessage[]) => {
    for (const appUser of appUsers) storeAppUser(appUser);
  };
  return {
    appUserMap,
    storeAppUser,
    storeAppUsers,
  };
});
