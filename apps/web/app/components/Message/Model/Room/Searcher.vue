<script setup lang="ts">
import { useRoomSearchStore } from "@/store/message/room/search";

const roomSearchStore = useRoomSearchStore();
const { searchQuery } = storeToRefs(roomSearchStore);
const isOpen = ref(false);
</script>

<template>
  <StyledSearchDialog
    v-model="isOpen"
    v-model:search-query="searchQuery"
    hotkey="ctrl+k"
    placeholder="Where would you like to go?"
  >
    <template #activator="{ updateIsOpen }">
      <v-btn text="Find or start a conversation" variant="outlined" @click="updateIsOpen(true)" />
    </template>
    <v-card-text overflow-y-auto>
      <MessageModelRoomListSearched @update:room="isOpen = false" />
    </v-card-text>
  </StyledSearchDialog>
</template>
