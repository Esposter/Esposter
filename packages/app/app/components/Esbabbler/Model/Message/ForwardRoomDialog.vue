<script setup lang="ts">
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

const { $trpc } = useNuxtApp();
const messageInputStore = useMessageInputStore();
const { forwardRowKey } = storeToRefs(messageInputStore);
const dialog = computed({
  get: () => Boolean(forwardRowKey),
  set: (newDialog) => {
    if (newDialog) return;
    forwardRowKey.value = undefined;
  },
});
const { hasMoreRoomsSearched, readMoreRoomsSearched, roomSearchQuery, roomsSearched } = useSearcher(
  (searchQuery, cursor) =>
    $trpc.room.readRooms.query({
      cursor,
      filter: { name: searchQuery },
    }),
  DatabaseEntityType.Room,
);
</script>

<template>
  <v-dialog v-model="dialog" persistent>
    <StyledCard>
      <v-card-title flex flex-col>
        <div flex space-between>
          Forward To
          <v-btn icon="mdi-close" @click="dialog = false" />
        </div>
        <v-text-field
          v-model="roomSearchQuery"
          placeholder="Search"
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
          <StyledWaypoint :active="hasMoreRoomsSearched" @change="readMoreRoomsSearched" />
        </v-list>
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>
