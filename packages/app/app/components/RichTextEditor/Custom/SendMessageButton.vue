<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const messageInputStore = useMessageInputStore();
const { validateMessageInput } = messageInputStore;
const disabled = computed(() => !validateMessageInput(editor));
const backgroundColor = computed(() => (disabled.value ? "transparent" : "currentColor"));
</script>

<template>
  <v-tooltip text="Send now">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-send"
        size="small"
        bg-transparent="!"
        :disabled
        :="props"
        @click="
          () => {
            if (!editor) return;
            sendMessage(editor);
          }
        "
      />
    </template>
  </v-tooltip>
</template>

<style scoped lang="scss">
:deep(.v-btn__overlay) {
  background-color: v-bind(backgroundColor);
}
</style>
