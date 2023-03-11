<script setup lang="ts">
import { useRoomStore } from "@/store/chat/room";

const { $client } = useNuxtApp();
const { createRoom } = useRoomStore();
const onCreateRoom = async () => {
  const newRoom = await $client.room.createRoom.mutate({ name: "Unnamed" });
  createRoom(newRoom);
};
</script>

<template>
  <v-tooltip text="Create Room">
    <template #activator="{ props }">
      <v-btn icon="mdi-plus" variant="plain" size="small" :ripple="false" :="props" @click="onCreateRoom" />
    </template>
  </v-tooltip>
</template>
