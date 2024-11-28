<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { useMessageStore } from "@/store/esbabbler/message";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const disabled = computed(() => Boolean(editor && EMPTY_TEXT_REGEX.test(editor.getText())));
const backgroundColor = computed(() => (disabled.value ? "transparent" : "currentColor"));
</script>

<template>
  <v-tooltip text="Send now">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        icon="mdi-send"
        size="small"
        bg-transparent="!"
        :disabled
        :="tooltipProps"
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
