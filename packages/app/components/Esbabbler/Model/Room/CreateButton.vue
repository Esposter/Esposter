<script setup lang="ts">
import { DEFAULT_NAME } from "@/shared/services/constants";
import { useRoomStore } from "@/store/esbabbler/room";

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
        @click="createRoom({ name: DEFAULT_NAME })"
      />
    </template>
  </v-tooltip>
</template>
