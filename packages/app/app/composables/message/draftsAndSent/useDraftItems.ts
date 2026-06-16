import { dayjs } from "#shared/services/dayjs";
import { getDraft } from "@/services/message/draft/getDraft";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useDraftItems = () => {
  const inputStore = useInputStore();
  const { draftRoomIds } = storeToRefs(inputStore);
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roomById = computed(() => new Map(rooms.value.map((room) => [room.id, room])));
  return computed(() =>
    [...draftRoomIds.value]
      .flatMap((roomId) => {
        const room = roomById.value.get(roomId);
        const draft = getDraft(roomId);
        return room && draft ? [{ content: draft.content, room, updatedAt: draft.updatedAt }] : [];
      })
      .toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)),
  );
};
