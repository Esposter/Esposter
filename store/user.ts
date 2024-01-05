import { type User } from "@/db/schema/users";
import { type UpdateUserInput } from "@/models/user/UpdateUserInput";

export const useUserStore = defineStore("user", () => {
  const { $client } = useNuxtApp();
  const userList = ref<User[]>([]);
  const authUser = ref<User>();

  const updateAuthUser = async (input: UpdateUserInput) => {
    const updatedAuthUser = await $client.user.updateUser.mutate(input);
    if (!updatedAuthUser) return;

    authUser.value = updatedAuthUser;
  };

  return { userList, authUser, updateAuthUser };
});
