import { useStatusStore } from "@/store/message/user/status";

export const useReadUserStatuses = () => {
  const { $trpc } = useNuxtApp();
  const statusStore = useStatusStore();
  const { statusMap } = storeToRefs(statusStore);
  return async (userIds: string[]) => {
    if (userIds.length === 0) return;

    const userStatuses = await $trpc.user.readStatuses.query(userIds);
    for (const { userId, ...userStatus } of userStatuses) statusMap.value.set(userId, userStatus);
  };
};
