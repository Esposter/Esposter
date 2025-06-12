import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/esbabbler/room";

export const useRefreshRoom = () => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  return async () => {
    rooms.value.length > 0
      ? await navigateTo(RoutePath.Messages(rooms.value[0].id), { replace: true })
      : await navigateTo(RoutePath.MessagesIndex, { replace: true });
  };
};
