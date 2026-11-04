<script setup lang="ts">
import type { PdfAnnotationsState, PdfViewerState } from "vue-pdfjs-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  annotations: PdfAnnotationsState;
  viewer: PdfViewerState;
}

const { annotations, viewer } = defineProps<Props>();
const { comments } = annotations;
// A row's value is its comment's place in the list, so a row chosen goes to the page its comment is on
const rows = computed(() =>
  (comments.value ?? []).map(({ contents, pageNumber }, index) => ({
    description: contents,
    meaning: UiIconMeaning.Comment,
    title: `Page ${pageNumber}`,
    value: String(index),
  })),
);
const goToComment = (value: string) => {
  const comment = comments.value?.[Number(value)];
  if (comment) viewer.goToPage(comment.pageNumber);
};
</script>

<template>
  <div v-if="comments === undefined" flex flex-col gap-2>
    <UiSkeleton h-6 />
    <UiSkeleton h-6 />
    <UiSkeleton h-6 />
  </div>
  <UiEmptyState v-else-if="comments.length === 0" :meaning="UiIconMeaning.Comment" title="This PDF has no comments" />
  <UiList v-else :items="rows" label="Comments" @select="(value) => goToComment(value)" />
</template>
