<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, isFindReplaceOpen, occurrences, replaceValue } =
  storeToRefs(findReplaceStore);
</script>

<template>
  <v-expand-transition>
    <v-sheet v-if="isFindReplaceOpen" p-2>
      <div flex gap-2 items-center>
        <ResourceSheetFindReplaceFindField />
        <v-text-field v-model="replaceValue" clearable density="compact" label="Replace with" max-w-52 />
        <span text-right w-16 op-medium-emphasis text-body-medium>
          <template v-if="findValue && occurrences.length === 0">No matches</template>
          <template v-else-if="occurrences.length > 0"
            >{{ currentOccurrenceIndex + 1 }} / {{ occurrences.length }}</template
          >
        </span>
        <ResourceSheetFindReplacePreviousOccurrenceButton />
        <ResourceSheetFindReplaceNextOccurrenceButton />
        <ResourceSheetFindReplaceReplaceButton />
        <ResourceSheetFindReplaceReplaceAllButton />
        <v-spacer />
        <ResourceSheetFindReplaceCloseButton />
      </div>
    </v-sheet>
  </v-expand-transition>
</template>
