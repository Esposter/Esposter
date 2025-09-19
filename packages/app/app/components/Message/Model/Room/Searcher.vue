<script setup lang="ts">
import { useSearchStore } from "@/store/message/room/search";

const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator>
      <v-btn text="Find or start a conversation" variant="outlined" @click="dialog = true" />
    </template>
    <StyledCard>
      <v-card-title>
        <v-text-field v-model="searchQuery" placeholder="Where would you like to go?" hide-details />
      </v-card-title>
      <v-card-text overflow-y-auto>
        <MessageModelRoomListSearched @update:room="dialog = false" />
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>
