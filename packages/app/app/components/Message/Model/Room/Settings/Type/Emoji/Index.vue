<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomEmojiStore } from "@/store/message/room/emoji";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomEmojiStore = useRoomEmojiStore();
const { items } = storeToRefs(roomEmojiStore);
</script>

<template>
  <v-list>
    <v-list-subheader>Emoji</v-list-subheader>
    <!-- The panel manages the set and never adds to it, so the empty state is the only place that can say where
     adding happens -->
    <v-list-item v-if="items.length === 0">
      <v-list-item-title>No emoji yet — add one from the emoji picker.</v-list-item-title>
    </v-list-item>
    <template v-else>
      <MessageModelRoomSettingsTypeEmojiListItem
        v-for="roomEmoji of items"
        :key="roomEmoji.id"
        :room-emoji
        :room-id="room.id"
      />
    </template>
    <MessageModelRoomSettingsTypeEmojiConfirmDeleteDialog :room-id="room.id" />
  </v-list>
</template>
