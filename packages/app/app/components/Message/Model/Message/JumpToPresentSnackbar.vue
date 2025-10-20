<script setup lang="ts">
import StyledButton from "@/components/Styled/Button.vue";
import { useScrollStore } from "@/store/message/scroll";

const scrollStore = useScrollStore();
const { isViewingOlderMessages } = storeToRefs(scrollStore);
const { jumpToPresent } = scrollStore;
</script>

<template>
  <TransitionFade>
    <v-snackbar :value="isViewingOlderMessages" color="background">
      <div flex justify-center items-center flex-wrap>
        You're Viewing Older Messages
        <StyledButton mx-2 :button-props="{ text: 'Jump to Present' }" @click="jumpToPresent" />
      </div>
    </v-snackbar>
  </TransitionFade>
</template>
