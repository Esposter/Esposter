<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-text-field
    v-model="roomStore.roomSearchQuery"
    placeholder="Search"
    prepend-inner-icon="mdi-magnify"
    density="compact"
    hide-details
  />
</template>
