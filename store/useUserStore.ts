import { defineStore } from "pinia";

export interface User {
  id: string;
  avatar: string;
  username: string;
}

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    users: [] as User[],
  }),
});
