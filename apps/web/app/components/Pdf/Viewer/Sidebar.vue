<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfViewerState } from "vue-pdfjs-headless";

import { PdfSidebarTab } from "@/models/pdf/PdfSidebarTab";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTabsVariant } from "@/models/ui/UiTabsVariant";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

interface Props {
  pdfDocument?: PDFDocumentProxy;
  viewer: PdfViewerState;
}

const { pdfDocument, viewer } = defineProps<Props>();
// The tab the reader last chose stays chosen in this browser, so the sidebar opens on it again
const tab = useLocalStorage<PdfSidebarTab>(LocalStorageKey.PdfSidebarTab, PdfSidebarTab.Outline, {
  writeDefaults: false,
});
const items: UiTabItem<PdfSidebarTab>[] = [
  { meaning: UiIconMeaning.Bookmark, title: "Outline", value: PdfSidebarTab.Outline },
  { meaning: UiIconMeaning.Image, title: "Thumbnails", value: PdfSidebarTab.Thumbnails },
];
</script>

<template>
  <!-- A column beside the pages from md, and an overlay over them below it, so the pages keep the whole width on a phone.
    The z-index lifts the overlay above the pages it covers, since the sidebar comes first in the tab order -->
  <div
    w="[min(18rem,85%)]"
    p-2
    flex
    flex-col
    gap-2
    min-h-0
    start-0
    inset-y-0
    absolute
    z-10
    of-hidden
    ui-frame
    md:shrink-0
    md:w-56
    md:static
  >
    <UiTabs v-model="tab" :items label="Sidebar" :variant="UiTabsVariant.Header" is-filling>
      <template #default="{ value }">
        <PdfViewerOutline v-if="value === PdfSidebarTab.Outline" :viewer />
        <PdfViewerThumbnailRail v-else :pdf-document :viewer />
      </template>
    </UiTabs>
  </div>
</template>
