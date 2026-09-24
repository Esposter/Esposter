<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { findValue, isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <!-- Enter and Shift+Enter step through the matches and Escape closes the bar, as a browser's find does -->
  <UiTextField
    v-model="findValue"
    is-autofocus
    label="Find"
    @keydown="
      (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          goToOccurrence(event.shiftKey ? -1 : 1);
        } else if (event.key === 'Escape') isFindReplaceOpen = false;
      }
    "
  />
</template>
