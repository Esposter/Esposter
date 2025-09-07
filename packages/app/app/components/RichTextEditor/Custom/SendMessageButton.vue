<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
const dataStore = useDataStore();
const { sendMessage } = dataStore;
const inputStore = useInputStore();
const { validateInput } = inputStore;
const disabled = computed(() => !validateInput(editor));
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
