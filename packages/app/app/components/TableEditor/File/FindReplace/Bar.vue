<script setup lang="ts">
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = findReplaceStore;
const { currentOccurrenceIndex, findValue, occurrences, replaceValue } = storeToRefs(findReplaceStore);
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
      <div flex items-center gap-2>
        <v-text-field
          v-model="findValue"
          autofocus
          clearable
          density="compact"
          hide-details
          label="Find"
          max-w-52
          variant="outlined"
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
        <v-text-field
          v-model="replaceValue"
          clearable
          density="compact"
          hide-details
          label="Replace with"
          max-w-52
          variant="outlined"
        />
        <span w-16 text-right class="text-sm text-medium-emphasis">
          <template v-if="findValue && occurrences.length === 0">No matches</template>
          <template v-else-if="occurrences.length > 0"
            >{{ currentOccurrenceIndex + 1 }} / {{ occurrences.length }}</template
          >
        </span>
        <v-tooltip text="Previous (Shift+Enter)">
          <template #activator="{ props }">
            <v-btn
              :disabled="occurrences.length === 0"
              icon="mdi-chevron-up"
              size="small"
              variant="text"
              :="props"
              @click="goToPrevious()"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="Next (Enter)">
          <template #activator="{ props }">
            <v-btn
              :disabled="occurrences.length === 0"
              icon="mdi-chevron-down"
              size="small"
              variant="text"
              :="props"
              @click="goToNext()"
            />
          </template>
        </v-tooltip>
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
        <v-btn density="compact" icon="mdi-close" variant="text" @click="isFindReplaceOpen = false" />
      </div>
    </v-sheet>
  </v-expand-transition>
</template>
