<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const props = defineProps<CustomEmojiPickerButtonProps>();
const { editor } = toRefs(props);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const messageInputStore = useMessageInputStore();
const { messageInputText } = storeToRefs(messageInputStore);
const disabled = computed(() => EMPTY_TEXT_REGEX.test(messageInputText.value));
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
