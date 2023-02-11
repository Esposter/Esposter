<script setup lang="ts">
import { useMessageInputStore } from "@/store/useMessageInputStore";
import { useMessageStore } from "@/store/useMessageStore";

const messageInputStore = useMessageInputStore();
const { updateMessageInput } = messageInputStore;
const { messageInput } = $(storeToRefs(messageInputStore));
const { sendMessage } = useMessageStore();
</script>

<template>
  <v-text-field
    placeholder="Aa"
    density="compact"
    hide-details
    clearable
    :model-value="messageInput"
    @update:model-value="updateMessageInput"
    @keydown.enter="sendMessage"
  >
    <template #clear>
      <ChatMessageInputClearButton />
    </template>
    <template #append-inner>
      <ChatMessageInputEmojiPickerButton />
      <ChatMessageInputSendMessageButton />
    </template>
  </v-text-field>
</template>

<style scoped lang="scss">
:deep(.v-field__append-inner),
:deep(.v-field__clearable) {
  padding-top: 0;
}

:deep(.v-field) {
  border-radius: 9999px;
}

:deep(.v-field__outline) {
  display: none;
}
</style>
