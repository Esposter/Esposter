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
const emptyState = { description: "", meaning: UiIconMeaning.Comment, title: "This PDF has no comments" };
</script>

<template>
  <UiAsyncBody
    :empty-state
    error=""
    :is-empty="comments?.length === 0 ? true : undefined"
    :is-pending="comments === undefined ? true : undefined"
  >
    <template #loading>
      <PdfViewerSidebarListSkeleton />
    </template>
    <UiList :items="rows" label="Comments" @select="(value) => goToComment(value)" />
  </UiAsyncBody>
</template>
