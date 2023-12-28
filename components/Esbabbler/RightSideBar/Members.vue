<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const memberStore = useMemberStore();
const { initialiseCursorPaginationData } = memberStore;
const { memberList } = storeToRefs(memberStore);

if (currentRoomId.value)
  initialiseCursorPaginationData(await $client.room.readMembers.query({ roomId: currentRoomId.value }));
</script>

<template>
  <EsbabblerModelMemberList :members="memberList" />
</template>
