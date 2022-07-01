import type { User } from "@/server/trpc/user";
import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    users: [] as User[],
  }),
});
