<script setup lang="ts">
import { useMemberStore } from "@/store/chat/useMemberStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const memberStore = useMemberStore();
const { initialiseMembersList } = memberStore;
const { memberList } = $(storeToRefs(memberStore));

const response = currentRoomId ? await $client.room.readMembers.query({ roomId: currentRoomId }) : null;
if (response) initialiseMembersList(response.members);
</script>

<template>
  <ChatModelMemberList :members="memberList" />
</template>
