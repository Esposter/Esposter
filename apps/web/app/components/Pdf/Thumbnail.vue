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
  <div w-full of-hidden>
    <canvas v-show="!isFailed" ref="canvas" w-full block />
    <p v-if="isFailed" text-sm text-muted p-3>The PDF could not be loaded.</p>
  </div>
</template>
