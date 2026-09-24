<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences, replaceValue } = storeToRefs(findReplaceStore);
const findReplace = useFindReplace();
</script>

<template>
  <UiButton
    :disabled="occurrences.length === 0"
    :variant="UiButtonVariant.Quiet"
    @click="
      () => {
        const occurrence = occurrences.at(currentOccurrenceIndex);
        if (occurrence) findReplace(findValue, replaceValue, occurrence);
      }
    "
  >
    Replace
  </UiButton>
</template>
