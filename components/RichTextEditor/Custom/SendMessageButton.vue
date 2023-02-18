<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const props = defineProps<CustomEmojiPickerButtonProps>();
const { editor } = toRefs(props);
const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const disabled = computed(() => messageInput.value.length === 0);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
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
            sendMessage(editor.getText());
            editor.commands.clearContent();
          }
        "
      />
    </template>
  </v-tooltip>
</template>
