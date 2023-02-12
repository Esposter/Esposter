import { useRoomStore } from "@/store/chat/useRoomStore";
import type { User } from "@prisma/client";

export const useMemberStore = defineStore("chat/member", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));

  const membersMap = ref<Record<string, User[]>>({});
  const memberList = computed(() => {
    if (!currentRoomId || !membersMap.value[currentRoomId]) return [];
    return membersMap.value[currentRoomId];
  });
  const pushMemberList = (members: User[]) => {
    if (!currentRoomId || !membersMap.value[currentRoomId]) return;
    membersMap.value[currentRoomId].push(...members);
  };

  const initialiseMembersList = (members: User[]) => {
    if (!currentRoomId) return;
    membersMap.value[currentRoomId] = members;
  };
  const createMember = (newMember: User) => {
    if (!currentRoomId || !membersMap.value[currentRoomId]) return;
    membersMap.value[currentRoomId].push(newMember);
  };
  const updateMember = (updatedMember: User) => {
    if (!currentRoomId || !membersMap.value[currentRoomId]) return;

    const members = membersMap.value[currentRoomId];
    const index = members.findIndex((m) => m.id === updatedMember.id);
    if (index > -1) membersMap.value[currentRoomId][index] = { ...members[index], ...updatedMember };
  };

  return {
    memberList,
    pushMemberList,
    initialiseMembersList,
    createMember,
    updateMember,
  };
});
