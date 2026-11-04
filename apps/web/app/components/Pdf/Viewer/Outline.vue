<script setup lang="ts">
import type { PdfViewerState } from "vue-pdfjs-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { flattenOutline } from "@/services/pdf/flattenOutline";

interface Props {
  viewer: PdfViewerState;
}

const { viewer } = defineProps<Props>();
const { followBookmark, outline } = viewer;
// The outline reads as loading until its read settles, so an outline still on its way is never taken for an empty one
const entries = computed(() => flattenOutline(outline.value ?? []));
const rows = computed(() =>
  entries.value.map(({ depth, item, key }) => ({
    depth,
    meaning: UiIconMeaning.Bookmark,
    title: item.title,
    value: key,
  })),
);
const keyItemMap = computed(() => new Map(entries.value.map(({ item, key }) => [key, item])));
</script>

<template>
  <div v-if="outline === undefined" flex flex-col gap-2>
    <UiSkeleton h-6 />
    <UiSkeleton h-6 />
    <UiSkeleton h-6 />
  </div>
  <UiEmptyState v-else-if="outline.length === 0" :meaning="UiIconMeaning.Bookmark" title="This PDF has no outline" />
  <UiList
    v-else
    :items="rows"
    label="Outline"
    @select="
      (key) => {
        const item = keyItemMap.get(key);
        if (item) followBookmark(item);
      }
    "
  >
    <template #title="{ item }">
      <span :style="{ paddingInlineStart: `${item.depth}rem` }">{{ item.title }}</span>
    </template>
  </UiList>
</template>
