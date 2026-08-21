<script setup lang="ts">
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { RoomInMessage } from "@esposter/db-schema";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

interface EmojiListItemProps {
  roomEmoji: RoomEmojiWithSasUrl;
  roomId: RoomInMessage["id"];
}

const { roomEmoji, roomId } = defineProps<EmojiListItemProps>();
const roomEmojiStore = useRoomEmojiStore();
const { updateRoomEmoji } = roomEmojiStore;
const rules = useVRules();
const name = ref(roomEmoji.name);
</script>

<template>
  <v-list-item>
    <template #prepend>
      <NuxtImg :alt="getEmojiShortcode(roomEmoji.name)" :src="roomEmoji.sasUrl" mr-4 size-8 object-contain />
    </template>
    <v-text-field
      v-model="name"
      :rules="[rules.pattern(ROOM_EMOJI_NAME_REGEX, 'Lowercase letters, numbers and underscores only')]"
      density="compact"
      variant="plain"
      @blur="
        () => {
          if (name === roomEmoji.name || !ROOM_EMOJI_NAME_REGEX.test(name)) {
            name = roomEmoji.name;
            return;
          }
          updateRoomEmoji(roomId, { id: roomEmoji.id, name });
        }
      "
    />
    <template #append>
      <MessageModelRoomSettingsTypeEmojiDeleteButton :id="roomEmoji.id" />
    </template>
  </v-list-item>
</template>
