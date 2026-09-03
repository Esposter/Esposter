import type { AppUserInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useAppUserStore } from "@/store/message/user/appUser";

export const useReadAppUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  const { storeAppUsers } = appUserStore;
  return async (appUserIds: AppUserInMessage["id"][]) => {
    if (!currentRoomId.value) return;

    const ids = appUserIds.filter((id) => !appUserMap.value.has(id));
    if (ids.length === 0) return;

    storeAppUsers(await $trpc.webhook.readAppUsers.query({ ids, roomId: currentRoomId.value }));
  };
};
