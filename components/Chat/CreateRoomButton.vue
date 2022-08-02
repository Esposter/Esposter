<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const { createRoom } = useRoomStore();
const onCreateRoom = async () => {
  const newRoom = await client.mutation("room.createRoom", { name: "Unnamed" });
  createRoom(newRoom);
};
</script>

<template>
  <!-- @NOTE Tooltip doesn't work yet, it will break route transitions https://github.com/vuetifyjs/vuetify/issues/15323 -->
  <!-- <v-tooltip #activator="{ props }" location="top" text="Create DM">
    <v-btn icon="mdi-plus" size="small" flat @click="onCreateRoom" :="props" />
  </v-tooltip> -->
  <v-btn icon="mdi-plus" size="small" flat @click="onCreateRoom" />
</template>
