import { useRoomStore } from "@/store/useRoomStore";
import type { User } from "@prisma/client";
import { defineStore } from "pinia";

export const useMemberStore = defineStore("member", () => {
  const roomStore = useRoomStore();
  const membersMap = ref<Record<string, User[]>>({});
  const members = computed(() => {
    if (!roomStore.currentRoomId || !membersMap.value[roomStore.currentRoomId]) return [];
    return membersMap.value[roomStore.currentRoomId];
  });
  const initialiseMembers = (members: User[]) => {
    if (!roomStore.currentRoomId) return;
    membersMap.value[roomStore.currentRoomId] = members;
  };
  const createMember = (newMember: User) => {
    if (!roomStore.currentRoomId) return;

    const members = membersMap.value[roomStore.currentRoomId] ?? [];
    members.push(newMember);
    membersMap.value[roomStore.currentRoomId] = members;
  };
  const updateMember = (updatedMember: User) => {
    if (!roomStore.currentRoomId) return;

    const members = membersMap.value[roomStore.currentRoomId] ?? [];
    const index = members.findIndex((m) => m.id === updatedMember.id);
    if (index > -1) membersMap.value[roomStore.currentRoomId][index] = { ...members[index], ...updatedMember };
  };

  const memberNextCursorMap = ref<Record<string, string | null>>({});
  const memberNextCursor = computed(() => {
    if (!roomStore.currentRoomId || !memberNextCursorMap.value[roomStore.currentRoomId]) return null;
    return memberNextCursorMap.value[roomStore.currentRoomId];
  });
  const updateMemberNextCursor = (memberNextCursor: string | null) => {
    if (!roomStore.currentRoomId) return;
    memberNextCursorMap.value[roomStore.currentRoomId] = memberNextCursor;
  };

  return {
    members,
    initialiseMembers,
    createMember,
    updateMember,
    memberNextCursor,
    updateMemberNextCursor,
  };
});
