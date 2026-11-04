<script setup lang="ts">
import type { PdfViewerState } from "vue-pdfjs-headless";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

interface Props {
  viewer: PdfViewerState;
}

const { viewer } = defineProps<Props>();
const { findNext, findPrevious, isNotFound, matchesCount, searchQuery } = viewer;
// The count reads nothing until a query is typed, and says so once a search finds no match
const matchesText = computed(() => {
  if (!searchQuery.value) return "";
  if (isNotFound.value) return "No matches";

  return `${matchesCount.value.current} of ${matchesCount.value.total}`;
});
</script>

<template>
  <UiForm role="search" flex gap-1 items-center @submit="() => findNext()">
    <UiTextField v-model="searchQuery" label="Search" :type="UiTextFieldType.Search" flex-1 min-w-0 />
    <span aria-live="polite" text-sm text-muted>{{ matchesText }}</span>
    <UiIconButton
      label="Previous match"
      :disabled="matchesCount.total === 0"
      :meaning="UiIconMeaning.ArrowUp"
      :variant="UiButtonVariant.Quiet"
      @click="() => findPrevious()"
    />
    <UiIconButton
      label="Next match"
      :disabled="matchesCount.total === 0"
      :meaning="UiIconMeaning.ArrowDown"
      :variant="UiButtonVariant.Quiet"
      @click="() => findNext()"
    />
  </UiForm>
</template>
