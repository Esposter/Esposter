<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/file/findReplace";

const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, isFindReplaceOpen, occurrences, replaceValue } =
  storeToRefs(findReplaceStore);
const findReplace = useFindReplace();

const goToPrevious = () => {
  if (occurrences.value.length === 0) return;
  currentOccurrenceIndex.value =
    (currentOccurrenceIndex.value - 1 + occurrences.value.length) % occurrences.value.length;
};

const goToNext = () => {
  if (occurrences.value.length === 0) return;
  currentOccurrenceIndex.value = (currentOccurrenceIndex.value + 1) % occurrences.value.length;
};
</script>

<template>
  <v-expand-transition>
    <v-sheet v-if="isFindReplaceOpen" p-2>
      <div flex gap-2 items-center>
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
                if (event.shiftKey) goToPrevious();
                else goToNext();
              } else if (event.key === 'Escape') isFindReplaceOpen = false;
            }
          "
        />
        <v-text-field v-model="replaceValue" clearable density="compact" hide-details label="Replace with" max-w-52 />
        <span text-right w-16 op-medium-emphasis text-body-medium>
          <template v-if="findValue && occurrences.length === 0">No matches</template>
          <template v-else-if="occurrences.length > 0"
            >{{ currentOccurrenceIndex + 1 }} / {{ occurrences.length }}</template
          >
        </span>
        <StyledTooltipIconButton
          :button-props="{ disabled: occurrences.length === 0, size: 'small', variant: 'text' }"
          icon="mdi-chevron-up"
          text="Previous (Shift+Enter)"
          @click="goToPrevious()"
        />
        <StyledTooltipIconButton
          :button-props="{ disabled: occurrences.length === 0, size: 'small', variant: 'text' }"
          icon="mdi-chevron-down"
          text="Next (Enter)"
          @click="goToNext()"
        />
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
        <v-btn
          :disabled="occurrences.length === 0"
          density="compact"
          text="Replace All"
          variant="text"
          @click="findReplace(findValue, replaceValue)"
        />
        <v-spacer />
        <StyledTooltipIconButton
          :button-props="{ density: 'compact', variant: 'text' }"
          icon="mdi-close"
          text="Close"
          @click="isFindReplaceOpen = false"
        />
      </div>
    </v-sheet>
  </v-expand-transition>
</template>
