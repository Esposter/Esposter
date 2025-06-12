import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/esbabbler/room";

export const useRefreshRoom = () => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const router = useRouter();
  return async () => {
    rooms.value.length > 0
      ? await router.push(RoutePath.Messages(rooms.value[0].id), { replace: true })
      : await router.push(RoutePath.MessagesIndex, { replace: true });
  };
};
