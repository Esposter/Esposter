<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { members } = storeToRefs(roomStore);
</script>

<template>
  <v-list>
    <ChatMemberListItem v-for="member in members" :key="member.id" :member="member" />
  </v-list>
</template>
