<script setup lang="ts">
import StyledButton from "@/components/Styled/Button.vue";
import { useMessageScrollStore } from "@/store/esbabbler/messageScroll";

const messageScrollStore = useMessageScrollStore();
const { isViewingOlderMessages } = storeToRefs(messageScrollStore);
const { jumpToPresent } = messageScrollStore;
</script>

<template>
  <TransitionFade>
    <v-snackbar v-model="isViewingOlderMessages" color="background">
      <div flex justify-center items-center flex-wrap>
        You're Viewing Older Messages <StyledButton mx-2 @click="jumpToPresent">Jump to Present</StyledButton>
      </div>
    </v-snackbar>
  </TransitionFade>
</template>
