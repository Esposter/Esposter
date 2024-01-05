import { type User } from "@/db/schema/users";
import { type UpdateUserInput } from "@/server/trpc/routers/user";

export const useUserStore = defineStore("user", () => {
  const { session, updateSession } = useAuth();
  const { $client } = useNuxtApp();
  const userList = ref<User[]>([]);

  const updateAuthUser = async (input: UpdateUserInput) => {
    if (!session.value) return;

    const updatedAuthUser = await $client.user.updateUser.mutate(input);
    if (!updatedAuthUser) return;

    updateSession({
      ...session.value,
      user: {
        id: updatedAuthUser.id,
        email: updatedAuthUser.email,
        image: updatedAuthUser.image,
        name: updatedAuthUser.name,
      },
    });
  };

  return { userList, updateAuthUser };
});
