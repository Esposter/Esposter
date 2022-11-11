<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const { createRoom } = useRoomStore();
const onCreateRoom = async () => {
  const { data } = await $client.room.createRoom.mutate({ name: "Unnamed" });
  if (data.value) createRoom(data.value);
};
</script>

<template>
  <v-tooltip location="top" text="Create DM">
    <template #activator="{ props }">
      <v-btn variant="plain" icon="mdi-plus" size="small" :ripple="false" flat :="props" @click="onCreateRoom" />
    </template>
  </v-tooltip>
</template>
