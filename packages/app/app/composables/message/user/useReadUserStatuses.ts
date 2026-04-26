import type { User } from "@esposter/db-schema";

import { useStatusStore } from "@/store/message/user/status";

export const useReadUserStatuses = () => {
  const { $trpc } = useNuxtApp();
  const statusStore = useStatusStore();
  const { statusMap } = storeToRefs(statusStore);
  return async (memberIds: User["id"][]) => {
    if (memberIds.length === 0) return;

    const userStatuses = await $trpc.user.readStatuses.query(memberIds);
    for (const { userId, ...userStatus } of userStatuses) statusMap.value.set(userId, userStatus);
  };
};
