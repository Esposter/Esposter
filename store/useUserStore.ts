import type { User } from "@prisma/client";

export const useUserStore = defineStore("user", () => {
  const userList = ref<User[]>([]);
  return { userList };
});
