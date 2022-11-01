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
  <!-- @NOTE: Tooltip doesn't work yet, it will break route transitions https://github.com/vuetifyjs/vuetify/issues/15323 -->
  <!-- <v-tooltip #activator="{ props }" location="top" text="Create DM">
    <v-btn icon="mdi-plus" size="small" flat @click="onCreateRoom" :="props" />
  </v-tooltip> -->
  <v-btn variant="plain" icon="mdi-plus" size="small" :ripple="false" @click="onCreateRoom" />
</template>
