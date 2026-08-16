<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences, replaceValue } = storeToRefs(findReplaceStore);
const findReplace = useFindReplace();
</script>

<template>
  <v-btn
    :disabled="occurrences.length === 0"
    density="compact"
    text="Replace"
    variant="text"
    @click="
      () => {
        const occurrence = occurrences.at(currentOccurrenceIndex);
        if (occurrence) findReplace(findValue, replaceValue, occurrence);
      }
    "
  />
</template>
