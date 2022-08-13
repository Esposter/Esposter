import type { User } from "@prisma/client";
import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    users: [] as User[],
  }),
});
