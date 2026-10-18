<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";
import type { PdfRenderer } from "vue-pdfjs-headless";

import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { loadPdfRenderer } from "@/services/pdf/loadPdfRenderer";
import { getResultAsync } from "@esposter/shared";
import { usePdfDocument } from "vue-pdfjs-headless";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const isOpen = ref(false);
const renderer = shallowRef<PdfRenderer>();
const isRendererFailed = ref(false);
// The read link is re-minted before it expires, which must not reload a document already open: the viewer would lose
// Its page, its zoom and the password. A link that has loaded no document yet is followed, so an expired one is retried
const source = ref(url);
const { isFailed, isPasswordRequested, isPasswordWrong, pdfDocument, submitPassword } = usePdfDocument({
  renderer,
  source,
});
const isAnyFailed = computed(() => isFailed.value || isRendererFailed.value);

onMounted(async () => {
  await getResultAsync(loadPdfRenderer).match(
    (loaded) => {
      renderer.value = loaded;
    },
    (error) => {
      isRendererFailed.value = true;
      console.error(error);
    },
  );
});

watch(
  () => url,
  (newUrl) => {
    if (!pdfDocument.value) source.value = newUrl;
  },
);
</script>

<template>
  <!-- A preview opens its message, so only the attachment in a message is pressed to open the viewer -->
  <PdfThumbnail
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :aria-label="isPreview ? undefined : `View ${file.filename}`"
    :is-failed="isAnyFailed"
    :pdf-document
    :role="isPreview ? undefined : 'button'"
    :tabindex="isPreview ? undefined : 0"
    @click="isOpen = true"
    @keydown.enter.self.prevent="isOpen = true"
    @keydown.space.self.prevent="isOpen = true"
  />
  <StyledDialog v-if="!isPreview" v-model="isOpen" :title="file.filename" w="[min(64rem,96vw)]" is-expandable>
    <!-- Its height in the middle of the screen, and all the dialog's height once the reader takes it over the page -->
    <PdfViewer
      h="[64dvh]"
      grow
      :filename="file.filename"
      :is-failed="isAnyFailed"
      :is-password-requested
      :is-password-wrong
      :pdf-document
      @submit-password="(password) => submitPassword(password)"
    />
  </StyledDialog>
</template>
