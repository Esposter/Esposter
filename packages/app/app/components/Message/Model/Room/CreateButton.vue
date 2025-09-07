<script setup lang="ts">
import { DEFAULT_NAME } from "#shared/services/constants";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { createRoom } = roomStore;
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
        @click="createRoom({ name: DEFAULT_NAME })"
      />
    </template>
  </v-tooltip>
</template>
