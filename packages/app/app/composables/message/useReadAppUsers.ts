import { useRoomStore } from "@/store/message/room";

export const useReadAppUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { appUserMap, currentRoomId } = storeToRefs(roomStore);
  return async (appUserIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = appUserIds.filter((id) => !appUserMap.value.has(id));
    if (ids.length === 0) return;

    const appUsers = await $trpc.webhook.readAppUsersByIds.query({ ids, roomId: currentRoomId.value });
    for (const appUser of appUsers) appUserMap.value.set(appUser.id, appUser);
  };
};
