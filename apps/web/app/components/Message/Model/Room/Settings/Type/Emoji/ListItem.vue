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

<!-- The emoji, its name as the field that renames it, and the button that deletes it -->
<template>
  <div role="listitem" flex gap-2 items-center>
    <NuxtImg :alt="getEmojiShortcode(roomEmoji.name)" :src="roomEmoji.sasUrl" shrink-0 size-8 object-contain />
    <MessageModelRoomEmojiNameField
      v-model="editedName"
      is-label-hidden
      flex-1
      min-w-0
      @focusout="
        () => {
          if (editedName === roomEmoji.name || !ROOM_EMOJI_NAME_REGEX.test(editedName)) {
            editedName = roomEmoji.name;
            return;
          }
          updateRoomEmoji(roomId, { id: roomEmoji.id, name: editedName });
        }
      "
    />
    <MessageModelRoomSettingsTypeEmojiDeleteButton :id="roomEmoji.id" />
  </div>
</template>
