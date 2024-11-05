import type { User } from "@/server/db/schema/users";
import type { UpdateUserInput } from "@/server/trpc/routers/user";

export const useUserStore = defineStore("user", () => {
  const { $client } = useNuxtApp();
  const userList = ref<User[]>([]);
  const authUser = ref<User>();

  const updateAuthUser = async (input: UpdateUserInput) => {
    const updatedAuthUser = await $client.user.updateUser.mutate(input);
    if (!updatedAuthUser) return;
    authUser.value = updatedAuthUser;
  };

  return { authUser, updateAuthUser, userList };
});
