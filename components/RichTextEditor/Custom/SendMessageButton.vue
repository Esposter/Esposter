<script setup lang="ts">
import { useMessageStore } from "@/store/chat/message";
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const props = defineProps<CustomEmojiPickerButtonProps>();
const { editor } = toRefs(props);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const disabled = computed(() => Boolean(editor?.value && EMPTY_TEXT_REGEX.test(editor.value.getText())));
const backgroundColor = computed(() => (disabled.value ? "transparent" : "currentColor"));
</script>

<template>
  <v-tooltip location="top" text="Send now">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        icon="mdi-send"
        size="small"
        bg="transparent!"
        :disabled="disabled"
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
