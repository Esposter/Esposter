<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfAnnotationsState, PdfViewerState } from "vue-pdfjs-headless";

import { PdfSidebarTab } from "@/models/pdf/PdfSidebarTab";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTabsVariant } from "@/models/ui/UiTabsVariant";

interface Props {
  annotations: PdfAnnotationsState;
  pdfDocument?: PDFDocumentProxy;
  viewer: PdfViewerState;
}

const tab = defineModel<PdfSidebarTab>("tab", { required: true });
const { annotations, pdfDocument, viewer } = defineProps<Props>();
const emit = defineEmits<{ chosePage: [] }>();
// The outline, the thumbnails and the comments go to their pages through this viewer, which also tells the dialog that
// A page was chosen
const pageViewer: PdfViewerState = {
  ...viewer,
  followBookmark: (item) => {
    viewer.followBookmark(item);
    emit("chosePage");
  },
  goToPage: (pageNumber) => {
    viewer.goToPage(pageNumber);
    emit("chosePage");
  },
};
const items: UiTabItem<PdfSidebarTab>[] = [
  { meaning: UiIconMeaning.Bookmark, title: "Outline", value: PdfSidebarTab.Outline },
  { meaning: UiIconMeaning.Image, title: "Thumbnails", value: PdfSidebarTab.Thumbnails },
  { meaning: UiIconMeaning.Comment, title: "Comments", value: PdfSidebarTab.Comments },
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
        <PdfViewerOutline v-if="value === PdfSidebarTab.Outline" :viewer="pageViewer" />
        <PdfViewerThumbnailRail v-else-if="value === PdfSidebarTab.Thumbnails" :pdf-document :viewer="pageViewer" />
        <PdfViewerComments v-else-if="value === PdfSidebarTab.Comments" :annotations :viewer="pageViewer" />
      </template>
    </UiTabs>
  </div>
</template>
