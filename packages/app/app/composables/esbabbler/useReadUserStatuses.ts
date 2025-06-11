import { useUserStatusStore } from "@/store/esbabbler/userStatus";

export const useReadUserStatuses = () => {
  const { $trpc } = useNuxtApp();
  const userStatusStore = useUserStatusStore();
  const { userStatusMap } = storeToRefs(userStatusStore);
  return async (userIds: string[]) => {
    const ids = userIds.filter((id) => !userStatusMap.value.has(id));
    if (ids.length === 0) return;

    const userStatuses = await $trpc.user.readStatuses.query(ids);
    for (const { userId, ...userStatus } of userStatuses) userStatusMap.value.set(userId, userStatus);
  };
};
