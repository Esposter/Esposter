import { getComposerTarget } from "@/services/message/composer/getComposerTarget";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useDraftItems = () => {
  const inputStore = useInputStore();
  const { drafts } = storeToRefs(inputStore);
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roomMap = computed(() => new Map(rooms.value.map((room) => [room.id, room])));
  return computed(() =>
    [...drafts.value]
      .flatMap(([composerKey, draft]) => {
        const { roomId, threadRootRowKey } = getComposerTarget(composerKey);
        const room = roomMap.value.get(roomId);
        return room
          ? [{ composerKey, content: draft.content, room, threadRootRowKey, updatedAt: draft.updatedAt }]
          : [];
      })
      .toSorted((firstDraft, secondDraft) => secondDraft.updatedAt.getTime() - firstDraft.updatedAt.getTime()),
  );
};
