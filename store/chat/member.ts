import { useRoomStore } from "@/store/chat/room";
import type { User } from "@prisma/client";

export const useMemberStore = defineStore("chat/member", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));

  const membersMap = ref<Record<string, User[]>>({});
  const memberList = computed({
    get: () => {
      if (!currentRoomId || !membersMap.value[currentRoomId]) return [];
      return membersMap.value[currentRoomId];
    },
    set: (newMemberList) => {
      if (!currentRoomId) return;
      membersMap.value[currentRoomId] = newMemberList;
    },
  });
  const pushMemberList = (members: User[]) => {
    memberList.value.push(...members);
  };

  const initialiseMembersList = (members: User[]) => {
    memberList.value = members;
  };
  const createMember = (newMember: User) => {
    memberList.value.push(newMember);
  };
  const updateMember = (updatedMember: User) => {
    const index = memberList.value.findIndex((m) => m.id === updatedMember.id);
    if (index > -1) memberList.value[index] = { ...memberList.value[index], ...updatedMember };
  };

  return {
    memberList,
    pushMemberList,
    initialiseMembersList,
    createMember,
    updateMember,
  };
});
