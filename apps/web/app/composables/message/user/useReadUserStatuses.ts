import type { PublicUser } from "@esposter/db-schema";

import { useStatusStore } from "#src/store/message/user/status";

export const useReadUserStatuses = () => {
  const { $trpc } = useNuxtApp();
  const statusStore = useStatusStore();
  const { storeStatuses } = statusStore;
  return async (memberIds: PublicUser["id"][]) => {
    if (memberIds.length === 0) return;

    storeStatuses(await $trpc.user.readStatuses.query(memberIds));
  };
};
