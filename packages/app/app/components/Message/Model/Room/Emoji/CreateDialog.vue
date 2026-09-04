<script setup lang="ts">
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { FileFieldValue } from "@/models/vuetify/FileFieldValue";
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { validateFile } from "@/services/file/validateFile";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { takeOne, withFinalizerAsync } from "@esposter/shared";

interface Props {
  roomId: RoomInMessage["id"];
}

defineSlots<{ activator?: (props: DialogActivatorSlotProps) => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const roomEmojiStore = useRoomEmojiStore();
const { createRoomEmoji } = roomEmojiStore;
const { items } = storeToRefs(roomEmojiStore);
const rules = useVRules();
const name = ref("");
const file = ref<File>();
const isFull = computed(() => items.value.length >= MAX_ROOM_EMOJIS);
// The same cap the write SAS is minted under, so an oversized image is refused by the field rather than by the
// Upload it would otherwise spend
const fileRules = computed(() => [
  rules.required(),
  (fileValue: FileFieldValue) => {
    if (!fileValue) return true;

    const uploadedFile = Array.isArray(fileValue) ? takeOne(fileValue) : fileValue;
    const result = validateFile(uploadedFile.size, MAX_ROOM_EMOJI_SIZE_BYTES);
    return result.isValid ? true : result.message;
  },
]);
</script>

<!-- Numbered steps rather than a bare pair of fields: uploading and naming are two decisions, and the name is
     also the thing the uploader will type later, which the field cannot say on its own -->
<template>
  <StyledFormDialog
    v-model="modelValue"
    :card-props="{ prependIcon: 'mdi-emoticon-plus', title: 'Add Emoji' }"
    :confirm-button-attrs="{ disabled: isFull }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        if (!file) return onComplete(false);

        const uploadedFile = file;
        await withFinalizerAsync(async () => {
          await createRoomEmoji(roomId, uploadedFile, { name });
          name = '';
          file = undefined;
        }, onComplete);
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <p m-0 text-body-medium>
      Your custom emoji will be available to everyone in this room. You'll find it in the room's own category of the
      emoji picker.
    </p>
    <div>
      <p font-semibold m-0 text-body-large>1. Upload an image</p>
      <p m-0 op-medium-emphasis text-body-medium>
        Square images with transparent backgrounds work best. It has to be under
        {{ MAX_ROOM_EMOJI_SIZE_BYTES / 1024 }} KB — we won't resize it for you.
      </p>
      <v-file-input
        accept="image/*"
        label="Image"
        :rules="fileRules"
        show-size
        mt-2
        @update:model-value="
          (files?) => {
            file = files ? (Array.isArray(files) ? takeOne(files) : files) : undefined;
          }
        "
      />
    </div>
    <div>
      <p font-semibold m-0 text-body-large>2. Give it a name</p>
      <p m-0 op-medium-emphasis text-body-medium>This is also what you'll type to add this emoji to your messages.</p>
      <MessageModelRoomEmojiNameField v-model="name" autofocus />
    </div>
    <p v-if="isFull" text-red m-0 text-body-medium>
      This room already has its {{ MAX_ROOM_EMOJIS }} {{ pluralize("emoji", MAX_ROOM_EMOJIS) }}. Delete one to add
      another.
    </p>
  </StyledFormDialog>
</template>
