<script setup lang="ts">
import type { PdfOutlineEntry } from "@/services/pdf/flattenOutline";
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
const keyItemMap = computed(() => new Map(entries.value.map(({ item, key }) => [key, item])));
// The outline in reading order, cut into runs: a run of entries with a destination is a list the reader follows, and a
// Run of entries with none is text, since there is nothing to follow
const runs = computed(() => {
  const entryRuns: { entries: PdfOutlineEntry[]; isFollowable: boolean }[] = [];
  for (const entry of entries.value) {
    const isFollowable = entry.item.dest !== null;
    const lastRun = entryRuns.at(-1);
    if (lastRun && lastRun.isFollowable === isFollowable) lastRun.entries.push(entry);
    else entryRuns.push({ entries: [entry], isFollowable });
  }
  return entryRuns.map(({ entries: runEntries, isFollowable }) => ({
    isFollowable,
    rows: runEntries.map(({ depth, item, key }) => ({
      depth,
      meaning: UiIconMeaning.Bookmark,
      title: item.title,
      value: key,
    })),
  }));
});
</script>

<template>
  <PdfViewerSidebarListSkeleton v-if="outline === undefined" />
  <UiEmptyState v-else-if="outline.length === 0" :meaning="UiIconMeaning.Bookmark" title="This PDF has no outline" />
  <template v-else>
    <template v-for="(run, index) of runs" :key="index">
      <UiList
        v-if="run.isFollowable"
        :items="run.rows"
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
      <!-- A run with no destination to follow is drawn as text, in the row layout a row that goes nowhere takes -->
      <div v-else role="list" aria-label="Outline" flex flex-col>
        <div v-for="{ depth, meaning, title, value } of run.rows" :key="value" role="listitem" ui-row>
          <UiItemContent :meaning :title>
            <template #title>
              <span :style="{ paddingInlineStart: `${depth}rem` }">{{ title }}</span>
            </template>
          </UiItemContent>
        </div>
      </div>
    </template>
  </template>
</template>
