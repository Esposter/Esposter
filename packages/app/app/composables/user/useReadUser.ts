import { useUserStore } from "@/store/user";

export const useReadUser = async () => {
  const { $client } = useNuxtApp();
  const userStore = useUserStore();
  const { authUser } = storeToRefs(userStore);
  authUser.value = await $client.user.readUser.query();
};
