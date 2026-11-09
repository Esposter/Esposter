<script setup lang="ts">
import type { PdfViewerState } from "vue-pdfjs-headless";

import { UiRules } from "@/services/ui/UiRules";

interface Props {
  filename: string;
  viewer: PdfViewerState;
}

const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
// The text is asked before the one download it stamps, and nothing is saved for an empty text. A text of only spaces is
// Empty too, so the field's rules refuse it and the form's validity holds the download
const watermark = ref("");
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Download"
    :is-confirm-disabled="!watermark || undefined"
    :submit="() => viewer.download(filename, watermark)"
    title="Download with watermark"
  >
    <UiTextField
      v-model="watermark"
      label="Watermark text"
      :rules="[UiRules.required('Enter the watermark text'), UiRules.pattern(/\S/u, 'Enter the watermark text')]"
    />
  </StyledFormDialog>
</template>
