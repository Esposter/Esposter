import { useRoomStore } from "@/store/message/room";
import { useAppUserStore } from "@/store/message/user/appUser";

export const useReadAppUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const appUserStore = useAppUserStore();
  const { items } = storeToRefs(appUserStore);
  const { pushAppUsers } = appUserStore;
  return async (appUserIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = appUserIds.filter((id) => !items.value.some((i) => i.id === id));
    if (ids.length === 0) return;

    const appUsersByIds = await $trpc.webhook.readAppUsersByIds.query({ ids, roomId: currentRoomId.value });
    pushAppUsers(...appUsersByIds);
  };
};
