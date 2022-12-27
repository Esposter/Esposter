<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const memberStore = useMemberStore();
const { pushMemberList, updateMemberListNextCursor, initialiseMembersList } = memberStore;
const { memberList, memberListNextCursor } = $(storeToRefs(memberStore));
const hasMore = $computed(() => Boolean(memberListNextCursor));
const fetchMoreMembers = async (onComplete: () => void) => {
  try {
    if (!currentRoomId) return;

    const response = await $client.room.readMembers.query({ roomId: currentRoomId, cursor: memberListNextCursor });
    if (response) {
      const { members, nextCursor } = response;
      pushMemberList(members);
      updateMemberListNextCursor(nextCursor);
    }
  } finally {
    onComplete();
  }
};

const response = currentRoomId ? await $client.room.readMembers.query({ roomId: currentRoomId, cursor: null }) : null;
if (response) {
  const { members, nextCursor } = response;
  initialiseMembersList(members);
  updateMemberListNextCursor(nextCursor);
}
</script>

<template>
  <ChatModelMemberList :members="memberList" :has-more="hasMore" :fetch-more-members="fetchMoreMembers" />
</template>
