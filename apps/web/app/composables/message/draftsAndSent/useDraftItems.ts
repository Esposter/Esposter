import { getComposerTarget } from "#src/services/message/composer/getComposerTarget";
import { useInputStore } from "#src/store/message/input/index";
import { useRoomStore } from "#src/store/message/room/index";

export const useDraftItems = () => {
  const inputStore = useInputStore();
  const { drafts } = storeToRefs(inputStore);
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roomMap = computed(() => new Map(rooms.value.map((room) => [room.id, room])));
  return computed(() =>
    [...drafts.value]
      .flatMap(([composerKey, draft]) => {
        const target = getComposerTarget(composerKey);
        if (!target) return [];
        const room = roomMap.value.get(target.roomId);
        return room
          ? [
              {
                composerKey,
                content: draft.content,
                room,
                threadRootId: target.threadRootId,
                updatedAt: draft.updatedAt,
              },
            ]
          : [];
      })
      .toSorted((firstDraft, secondDraft) => secondDraft.updatedAt.getTime() - firstDraft.updatedAt.getTime()),
  );
};
