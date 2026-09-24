<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomEmojiStore = useRoomEmojiStore();
const { items } = storeToRefs(roomEmojiStore);
</script>

<template>
  <div py-4 flex flex-col gap-4 ui-body>
    <!-- The panel manages the set and never adds to it, so the empty state is the only place that can say where
         adding happens -->
    <UiEmptyState
      v-if="items.length === 0"
      description="Add one from the emoji picker."
      :meaning="UiIconMeaning.Favorite"
      title="No emoji yet"
    />
    <div v-else role="list" aria-label="Emoji" flex flex-col>
      <MessageModelRoomSettingsTypeEmojiListItem
        v-for="roomEmoji of items"
        :key="roomEmoji.id"
        :room-emoji
        :room-id="room.id"
      />
    </div>
    <MessageModelRoomSettingsTypeEmojiConfirmDeleteDialog :room-id="room.id" />
  </div>
</template>
