<script setup lang="ts">
import StyledButton from "@/components/Styled/Button.vue";
import { useMessageStore } from "@/store/esbabbler/message";

const messageStore = useMessageStore();
const { isViewingOlderMessages } = storeToRefs(messageStore);
const { scrollToBottom } = messageStore;
</script>

<template>
  <TransitionFade>
    <v-snackbar v-if="isViewingOlderMessages" color="background">
      <span>You're Viewing Older Messages</span>
      <StyledButton @click="scrollToBottom">Jump to Present</StyledButton>
    </v-snackbar>
  </TransitionFade>
</template>
