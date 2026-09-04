<script setup lang="ts">
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { RoomInMessage } from "@esposter/db-schema";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

interface Props {
  roomEmoji: RoomEmojiWithSasUrl;
  roomId: RoomInMessage["id"];
}

const { roomEmoji, roomId } = defineProps<Props>();
const roomEmojiStore = useRoomEmojiStore();
const { updateRoomEmoji } = roomEmojiStore;
const editedName = ref(roomEmoji.name);
// A rename from another device replaces the field, unless what is in it is an edit of the previous name that
// Has not been committed yet — that edit is the one the user is still typing
watch(
  () => roomEmoji.name,
  (newName, oldName) => {
    if (editedName.value === oldName) editedName.value = newName;
  },
);
</script>

<template>
  <v-list-item>
    <template #prepend>
      <NuxtImg :alt="getEmojiShortcode(roomEmoji.name)" :src="roomEmoji.sasUrl" mr-4 size-8 object-contain />
    </template>
    <MessageModelRoomEmojiNameField
      v-model="editedName"
      density="compact"
      variant="plain"
      @blur="
        () => {
          if (editedName === roomEmoji.name || !ROOM_EMOJI_NAME_REGEX.test(editedName)) {
            editedName = roomEmoji.name;
            return;
          }
          updateRoomEmoji(roomId, { id: roomEmoji.id, name: editedName });
        }
      "
    />
    <template #append>
      <MessageModelRoomSettingsTypeEmojiDeleteButton :id="roomEmoji.id" />
    </template>
  </v-list-item>
</template>
