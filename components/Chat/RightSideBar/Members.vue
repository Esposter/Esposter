<script setup lang="ts">
import { useMemberStore } from "@/store/chat/member";
import { useRoomStore } from "@/store/chat/room";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const memberStore = useMemberStore();
const { initialiseMembersList } = memberStore;
const { memberList } = $(storeToRefs(memberStore));

if (currentRoomId) {
  const members = await $client.room.readMembers.query({ roomId: currentRoomId });
  initialiseMembersList(members);
}
</script>

<template>
  <ChatModelMemberList :members="memberList" />
</template>
