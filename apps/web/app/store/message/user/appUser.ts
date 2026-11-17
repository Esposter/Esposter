import type { NamedAppUserInMessage } from "#shared/models/db/webhook/NamedAppUserInMessage";

// The bot identities a webhook posts as, cached across the rooms one blade session visits — the same shape
// `useUserStore` gives a person, and written through the same kind of setter so no surface reaches into the map.
// Each carries the webhook's name beside the image the identity owns, which the read that answers it joins in
export const useAppUserStore = defineStore("message/user/appUser", () => {
  const appUserMap = ref(new Map<string, NamedAppUserInMessage>());
  const storeAppUser = (appUser: NamedAppUserInMessage) => {
    appUserMap.value.set(appUser.id, appUser);
  };
  const storeAppUsers = (appUsers: NamedAppUserInMessage[]) => {
    for (const appUser of appUsers) storeAppUser(appUser);
  };
  return { appUserMap, storeAppUsers };
});
