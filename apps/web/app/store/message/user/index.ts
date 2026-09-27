import type { PublicUser } from "@esposter/db-schema";

export const useUserStore = defineStore("message/user", () => {
  const userMap = ref(new Map<string, PublicUser>());
  const storeUser = (user: PublicUser) => {
    userMap.value.set(user.id, user);
  };
  const storeUsers = (users: PublicUser[]) => {
    for (const user of users) storeUser(user);
  };

  return { storeUser, storeUsers, userMap };
});
