import type { User } from "@/db/schema/users";

export const useUserStore = defineStore("user", () => {
  const userList = ref<User[]>([]);
  return { userList };
});
