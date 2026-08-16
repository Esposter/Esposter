<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { findValue, isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <v-text-field
    v-model="findValue"
    autofocus
    clearable
    density="compact"
    hide-details
    label="Find"
    max-w-52
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
