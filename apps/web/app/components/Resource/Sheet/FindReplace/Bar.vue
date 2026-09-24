<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, isFindReplaceOpen, occurrences, replaceValue } =
  storeToRefs(findReplaceStore);
</script>

<template>
  <!-- One line: the two fields yield their width as the bar runs short, and the commands and close keep theirs -->
  <div v-if="isFindReplaceOpen" class="bar" role="search" aria-label="Find and replace" flex gap-2 items-end>
    <div flex-1 min-w-0>
      <ResourceSheetFindReplaceFindField />
    </div>
    <div flex-1 min-w-0>
      <UiTextField v-model="replaceValue" label="Replace with" />
    </div>
    <span role="status" text-sm text-muted text-right min-w-16 text-nowrap self-center>
      <template v-if="findValue && occurrences.length === 0">No matches</template>
      <template v-else-if="occurrences.length > 0"
        >{{ currentOccurrenceIndex + 1 }} / {{ occurrences.length }}</template
      >
    </span>
    <ResourceSheetFindReplacePreviousOccurrenceButton />
    <ResourceSheetFindReplaceNextOccurrenceButton />
    <ResourceSheetFindReplaceButton />
    <ResourceSheetFindReplaceAllButton />
    <ResourceSheetFindReplaceCloseButton />
  </div>
</template>

<style scoped>
/* It drops in under the search it belongs to, rather than appearing at once */
.bar {
  transition:
    opacity var(--ui-motion-medium),
    translate var(--ui-motion-medium);
}

@starting-style {
  .bar {
    opacity: 0;
    translate: 0 calc(var(--ui-step) * -2);
  }
}
</style>
