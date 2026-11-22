import type { AppUserInMessage, RoomInMessage } from "@esposter/db-schema";

import { useAppUserStore } from "#src/store/message/user/appUser";

export const useReadAppUsers = () => {
  const { $trpc } = useNuxtApp();
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  const { setAppUsers } = appUserStore;
  return async (roomId: RoomInMessage["id"], appUserIds: AppUserInMessage["id"][]) => {
    const ids = appUserIds.filter((id) => !appUserMap.value.has(id));
    if (ids.length === 0) return;

    setAppUsers(await $trpc.webhook.readAppUsers.query({ ids, roomId }));
  };
};
