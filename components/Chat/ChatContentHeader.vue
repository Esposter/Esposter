<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-toolbar class="bg-transparent" tag="div" height="56" border>
    <v-toolbar-title>{{ roomStore.name }}</v-toolbar-title>
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
    </template>
  </v-toolbar>
</template>
