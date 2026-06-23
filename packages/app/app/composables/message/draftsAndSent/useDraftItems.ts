import { dayjs } from "#shared/services/dayjs";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useDraftItems = () => {
  const inputStore = useInputStore();
  const { drafts } = storeToRefs(inputStore);
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roomById = computed(() => new Map(rooms.value.map((room) => [room.id, room])));
  return computed(() =>
    [...drafts.value]
      .flatMap(([roomId, draft]) => {
        const room = roomById.value.get(roomId);
        return room ? [{ content: draft.content, room, updatedAt: draft.updatedAt }] : [];
      })
      .toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)),
  );
};
