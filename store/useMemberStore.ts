import { useRoomStore } from "@/store/useRoomStore";
import type { User } from "@prisma/client";

export const useMemberStore = defineStore("member", () => {
  const roomStore = useRoomStore();
  const membersMap = ref<Record<string, User[]>>({});
  const memberList = computed(() => {
    if (!roomStore.currentRoomId || !membersMap.value[roomStore.currentRoomId]) return [];
    return membersMap.value[roomStore.currentRoomId];
  });
  const pushMemberList = (members: User[]) => {
    if (!roomStore.currentRoomId || !membersMap.value[roomStore.currentRoomId]) return;
    membersMap.value[roomStore.currentRoomId].push(...members);
  };

  const initialiseMembersList = (members: User[]) => {
    if (!roomStore.currentRoomId) return;
    membersMap.value[roomStore.currentRoomId] = members;
  };
  const createMember = (newMember: User) => {
    if (!roomStore.currentRoomId || !membersMap.value[roomStore.currentRoomId]) return;
    membersMap.value[roomStore.currentRoomId].push(newMember);
  };
  const updateMember = (updatedMember: User) => {
    if (!roomStore.currentRoomId || !membersMap.value[roomStore.currentRoomId]) return;

    const members = membersMap.value[roomStore.currentRoomId];
    const index = members.findIndex((m) => m.id === updatedMember.id);
    if (index > -1) membersMap.value[roomStore.currentRoomId][index] = { ...members[index], ...updatedMember };
  };

  return {
    memberList,
    pushMemberList,
    initialiseMembersList,
    createMember,
    updateMember,
  };
});
