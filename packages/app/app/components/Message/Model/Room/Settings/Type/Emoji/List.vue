<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomEmojiStore } from "@/store/message/room/emoji";

interface EmojiListProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<EmojiListProps>();
const roomEmojiStore = useRoomEmojiStore();
const { items } = storeToRefs(roomEmojiStore);
</script>

<template>
  <v-list>
    <v-list-subheader>Emoji</v-list-subheader>
    <v-list-item v-if="items.length === 0">
      <v-list-item-title>No emoji uploaded</v-list-item-title>
    </v-list-item>
    <template v-else>
      <MessageModelRoomSettingsTypeEmojiListItem v-for="roomEmoji of items" :key="roomEmoji.id" :room-emoji :room-id />
    </template>
    <MessageModelRoomSettingsTypeEmojiConfirmDeleteDialog :room-id />
  </v-list>
</template>
