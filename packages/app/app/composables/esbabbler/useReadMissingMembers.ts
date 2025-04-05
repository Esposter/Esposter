import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMissingMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { pushMemberList } = memberStore;
  const { members } = storeToRefs(memberStore);
  return async (messages: MessageEntity[]) => {
    if (!currentRoomId.value) return;

    const messagesMissingMember = messages.filter(({ userId }) => !members.value.some(({ id }) => id === userId));
    if (messagesMissingMember.length === 0) return;

    const membersByIds = await $trpc.room.readMembersByIds.query({
      ids: messagesMissingMember.map(({ userId }) => userId),
      roomId: currentRoomId.value,
    });
    pushMemberList(...membersByIds);
  };
};
