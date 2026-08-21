<script setup lang="ts">
import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { validateFile } from "@/services/file/validateFile";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";
import { takeOne, withFinalizerAsync } from "@esposter/shared";

interface EmojiProps {
  room: RoomInMessage;
}

const { room } = defineProps<EmojiProps>();
const roomEmojiStore = useRoomEmojiStore();
const { createRoomEmoji, readRoomEmojis } = roomEmojiStore;
const { items } = storeToRefs(roomEmojiStore);
await readRoomEmojis(room.id);
const rules = useVRules();
const name = ref("");
const file = ref<File>();
const isLoading = ref(false);
// The name is checked here as well as in the column, so a typo is reported by the field rather than by a
// Rejected upload — the guard on the write is what makes it true, this is what makes it kind
const isValidName = computed(() => ROOM_EMOJI_NAME_REGEX.test(name.value));
const isFull = computed(() => items.value.length >= MAX_ROOM_EMOJIS);
// The same cap the write SAS is minted under, checked here so an oversized drop is refused before it uploads
const validateFileRule = (fileValue: FileFieldValue) => {
  if (!fileValue) return true;

  const result = validateFile(
    (Array.isArray(fileValue) ? takeOne(fileValue) : fileValue).size,
    MAX_ROOM_EMOJI_SIZE_BYTES,
  );
  return result.isValid ? true : result.message;
};
</script>

<template>
  <div flex flex-col gap-y-4>
    <div flex gap-x-4 items-center justify-center>
      <v-text-field
        v-model="name"
        density="compact"
        label="Name"
        :disabled="isLoading"
        :rules="[rules.pattern(ROOM_EMOJI_NAME_REGEX, 'Lowercase letters, numbers and underscores only')]"
      />
      <v-file-input
        accept="image/*"
        density="compact"
        label="Image"
        :disabled="isLoading"
        :rules="[validateFileRule]"
        show-size
        @update:model-value="
          (files?) => {
            file = files ? (Array.isArray(files) ? takeOne(files) : files) : undefined;
          }
        "
      />
      <StyledButton
        :disabled="!file || !isValidName || isFull"
        :loading="isLoading"
        @click="
          async () => {
            if (!file || !isValidName) return;

            const uploadedFile = file;
            isLoading = true;
            await withFinalizerAsync(
              async () => {
                await createRoomEmoji(room.id, uploadedFile, { name });
                name = '';
                file = undefined;
              },
              () => {
                isLoading = false;
              },
            );
          }
        "
      >
        Upload
      </StyledButton>
    </div>
    <div v-if="isFull" text-red text-body-medium>
      You can only upload up to {{ MAX_ROOM_EMOJIS }} {{ pluralize("emoji", MAX_ROOM_EMOJIS) }}.
    </div>
    <MessageModelRoomSettingsTypeEmojiList :room-id="room.id" />
  </div>
</template>
