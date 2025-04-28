<script setup lang="ts">
import type { Room } from "#shared/db/schema/rooms";

import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const messageInputStore = useMessageInputStore();
const { forwardRowKey } = storeToRefs(messageInputStore);
const dialog = computed({
  get: () => Boolean(forwardRowKey),
  set: (newDialog) => {
    if (newDialog) return;
    forwardRowKey.value = undefined;
  },
});
const roomSearchQuery = ref("");
const roomsSearched = ref<Room[]>([]);
</script>

<template>
  <v-dialog v-model="dialog" persistent>
    <StyledCard>
      <v-card-title>
        <v-text-field
          v-model="roomSearchQuery"
          placeholder="Where would you like to go?"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
        />
      </v-card-title>
      <v-card-text overflow-y="auto">
        <v-list>
          <v-list-item v-for="{ id, name, image } of roomsSearched" :key="id" :title="name">
            <template #prepend>
              <StyledAvatar :image :name />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>
