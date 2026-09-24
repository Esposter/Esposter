<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, isFindReplaceOpen, occurrences, replaceValue } =
  storeToRefs(findReplaceStore);
</script>

<template>
  <div v-if="isFindReplaceOpen" class="bar" role="search" aria-label="Find and replace" flex flex-wrap gap-2 items-end>
    <div w-52>
      <ResourceSheetFindReplaceFindField />
    </div>
    <div w-52>
      <UiTextField v-model="replaceValue" label="Replace with" />
    </div>
    <span role="status" text-muted text-right min-w-16>
      <template v-if="findValue && occurrences.length === 0">No matches</template>
      <template v-else-if="occurrences.length > 0"
        >{{ currentOccurrenceIndex + 1 }} / {{ occurrences.length }}</template
      >
    </span>
    <ResourceSheetFindReplacePreviousOccurrenceButton />
    <ResourceSheetFindReplaceNextOccurrenceButton />
    <ResourceSheetFindReplaceReplaceButton />
    <ResourceSheetFindReplaceReplaceAllButton />
    <div ml-a>
      <ResourceSheetFindReplaceCloseButton />
    </div>
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
