import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

export const useRoomPlaceholder = () => {
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  return computed(() => {
    const member = members.value.find(({ id }) => id === currentRoom.value?.userId);
    return member ? `${member.name}'s Room` : "";
  });
};
