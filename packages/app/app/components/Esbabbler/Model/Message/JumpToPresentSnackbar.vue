<script setup lang="ts">
import StyledButton from "@/components/Styled/Button.vue";
import { useMessageStore } from "@/store/esbabbler/message";

const messageStore = useMessageStore();
const { isViewingOlderMessages } = storeToRefs(messageStore);
const { scrollToBottom } = messageStore;
</script>

<template>
  <TransitionFade>
    <v-snackbar v-model="isViewingOlderMessages" color="background">
      <div flex justify-center items-center flex-wrap>
        You're Viewing Older Messages <StyledButton mx-2 @click="scrollToBottom">Jump to Present</StyledButton>
      </div>
    </v-snackbar>
  </TransitionFade>
</template>
