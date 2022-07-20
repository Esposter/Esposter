<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const { createRoom } = useRoomStore();
const addRoom = async () => createRoom(await client.mutation("room.createRoom", { name: "Unnamed" }));
</script>

<template>
  <!-- Tooltip doesn't work yet, it will break route transitions https://github.com/vuetifyjs/vuetify/issues/15323 -->
  <!-- <v-tooltip #activator="{ props }" location="top" text="Create DM">
    <v-btn icon="mdi-plus" size="small" flat :="props" />
  </v-tooltip> -->
  <v-btn icon="mdi-plus" size="small" flat @click="addRoom" />
</template>
