<script setup lang="ts">
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { getFileSize } from "@/services/file/getFileSize";
import { validateFile } from "@/services/file/validateFile";
import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  roomId: RoomInMessage["id"];
}

defineSlots<{ activator?: (props: DialogActivatorSlotProps) => VNode }>();
const modelValue = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const roomEmojiStore = useRoomEmojiStore();
const { createRoomEmoji } = roomEmojiStore;
const { items } = storeToRefs(roomEmojiStore);
const name = ref("");
const files = ref<File[]>([]);
const file = computed(() => files.value.at(0));
const isFull = computed(() => items.value.length >= MAX_ROOM_EMOJIS);
// The same cap the write SAS is minted under, so an oversized image is refused here rather than by the upload it
// Would otherwise spend
const fileValidation = computed(() =>
  file.value ? validateFile(file.value.size, MAX_ROOM_EMOJI_SIZE_BYTES) : undefined,
);
// The fields are the library's, which the dialog's own form cannot count, so what they check gates the save here too
const isNameValid = computed(
  () => name.value.length <= ROOM_EMOJI_NAME_MAX_LENGTH && ROOM_EMOJI_NAME_REGEX.test(name.value),
);
</script>

<!-- Numbered steps rather than a bare pair of fields: uploading and naming are two decisions, and the name is
     also the thing the uploader will type later, which the field cannot say on its own -->
<template>
  <!-- @TODO: a UiDialog once the emoji picker that opens it is the library's; a click in a top-layer dialog opened
       out of a Vuetify menu lands outside the menu, which unmounts it (/docs/proposals/refactors/ui-library) -->
  <StyledFormDialog
    v-model="modelValue"
    :card-props="{ prependIcon: 'i-mdi:emoticon-plus', title: 'Add Emoji' }"
    :confirm-button-attrs="{ disabled: isFull || !fileValidation?.isValid || !isNameValid }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        if (!file) return onComplete(false);

        const uploadedFile = file;
        await withFinalizerAsync(async () => {
          await createRoomEmoji(roomId, uploadedFile, { name });
          name = '';
          files = [];
        }, onComplete);
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div flex flex-col gap-4 ui-body>
      <p>
        Your custom emoji will be available to everyone in this room. You'll find it in the room's own category of the
        emoji picker.
      </p>
      <section flex flex-col gap-2>
        <h3 ui-heading>1. Upload an image</h3>
        <p text-sm text-muted>
          Square images with transparent backgrounds work best. It has to be under
          {{ getFileSize(MAX_ROOM_EMOJI_SIZE_BYTES) }} — we won't resize it for you.
        </p>
        <UiFileField v-model="files" accept="image/*" label="Image" />
        <p v-if="fileValidation && !fileValidation.isValid" role="alert" text-sm text-error>
          {{ fileValidation.message }}
        </p>
      </section>
      <section flex flex-col gap-2>
        <h3 ui-heading>2. Give it a name</h3>
        <p text-sm text-muted>
          This is also what you'll type to add this emoji to your messages:
          <code>{{ getEmojiShortcode(name || "avocado") }}</code>
        </p>
        <MessageModelRoomEmojiNameField v-model="name" is-autofocus />
      </section>
      <UiAlert v-if="isFull" status="error">
        This room already has its {{ MAX_ROOM_EMOJIS }} {{ pluralize("emoji", MAX_ROOM_EMOJIS) }}. Delete one to add
        another.
      </UiAlert>
    </div>
  </StyledFormDialog>
</template>
