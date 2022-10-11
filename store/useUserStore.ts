import type { User } from "@prisma/client";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const userList = ref<User[]>([]);

  return { userList };
});
