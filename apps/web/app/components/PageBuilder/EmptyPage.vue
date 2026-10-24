<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  announce: (message: string) => void;
  getDocument: () => undefined | WebpageDocument;
  kind: WebpageKind;
  resourceId: string;
}
const { announce, getDocument, kind, resourceId } = defineProps<Props>();
</script>

<template>
  <UiEmptyState :meaning="UiIconMeaning.Sheet" title="This page is empty">
    <PageBuilderPalette :announce :get-document :kind :resource-id />
  </UiEmptyState>
</template>
