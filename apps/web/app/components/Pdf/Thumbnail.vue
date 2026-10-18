<script setup lang="ts">
import type { PDFDocumentProxy } from "pdfjs-dist";

import { usePdfPage } from "vue-pdfjs-headless";

interface Props {
  isFailed: boolean;
  pdfDocument?: PDFDocumentProxy;
}

const { isFailed, pdfDocument } = defineProps<Props>();
const canvas = useTemplateRef("canvas");

usePdfPage({ canvas: () => canvas.value ?? undefined, pageNumber: 1, pdfDocument: () => pdfDocument });
</script>

<template>
  <div of-hidden w-full>
    <canvas v-show="!isFailed" ref="canvas" block w-full />
    <p v-if="isFailed" p-3 text-sm text-muted>The PDF could not be loaded.</p>
  </div>
</template>
