<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { roomSearchQuery } = storeToRefs(roomStore);
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator>
      <v-btn variant="outlined" @click="dialog = true">Find or start a conversation</v-btn>
    </template>
    <StyledCard>
      <v-card-title>
        <v-text-field v-model="roomSearchQuery" placeholder="Where would you like to go?" hide-details />
      </v-card-title>
      <v-card-text overflow-y-auto>
        <EsbabblerModelRoomListSearched @update:room="dialog = false" />
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>
