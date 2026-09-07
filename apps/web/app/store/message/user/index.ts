import type { User } from "@esposter/db-schema";

export const useUserStore = defineStore("message/user", () => {
  const userMap = ref(new Map<string, User>());
  const storeUser = (user: User) => {
    userMap.value.set(user.id, user);
  };
  const storeUsers = (users: User[]) => {
    for (const user of users) storeUser(user);
  };

  return {
    storeUser,
    storeUsers,
    userMap,
  };
});
