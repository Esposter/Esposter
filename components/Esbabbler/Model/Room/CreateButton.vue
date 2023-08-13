<script setup lang="ts">
import { DEFAULT_NAME } from "@/services/shared/constants";
import { useRoomStore } from "@/store/esbabbler/room";

const { $client } = useNuxtApp();
const { createRoom } = useRoomStore();
</script>

<template>
  <v-tooltip text="Create Room">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-plus"
        variant="plain"
        size="small"
        :ripple="false"
        :="props"
        @click="
          async () => {
            const newRoom = await $client.room.createRoom.mutate({ name: DEFAULT_NAME });
            createRoom(newRoom);
          }
        "
      />
    </template>
  </v-tooltip>
</template>
