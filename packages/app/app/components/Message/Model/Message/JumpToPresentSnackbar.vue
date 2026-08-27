<script setup lang="ts">
import StyledButton from "@/components/Styled/Button.vue";
import { SNACKBAR_PERSISTENT_TIMEOUT } from "@/services/vuetify/constants";
import { useScrollStore } from "@/store/message/ui/scroll";

const scrollStore = useScrollStore();
const { isViewingOlderMessages } = storeToRefs(scrollStore);
const { jumpToPresent } = scrollStore;
</script>

<template>
  <TransitionFade>
    <!-- Persistent, because it reports where the reader is rather than something that happened: a timeout would
      retract it while the list is still in the past, and the one-way binding cannot bring it back until the
      value flips. It sits at the foot of the list for the same reason, against the app default that puts a
      toast in the corner — the present is what it points back to, so it belongs at the end the list is
      scrolled away from -->
    <v-snackbar
      location="bottom center"
      :model-value="isViewingOlderMessages"
      :timeout="SNACKBAR_PERSISTENT_TIMEOUT"
      color="background"
    >
      <div flex flex-wrap items-center justify-center>
        You're Viewing Older Messages
        <StyledButton mx-2 :button-props="{ text: 'Jump to Present' }" @click="jumpToPresent" />
      </div>
    </v-snackbar>
  </TransitionFade>
</template>
