<script setup lang="ts">
import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  announce: (message: string) => void;
  getDocument: () => AnyPageBuilderDocument | undefined;
  kind: AnyPageBuilderKind;
  resourceId: string;
}
const { announce, getDocument, kind, resourceId } = defineProps<Props>();
</script>

<template>
  <UiEmptyState :meaning="UiIconMeaning.Sheet" title="This page is empty">
    <PageBuilderPalette w-full :announce :get-document :kind :resource-id />
  </UiEmptyState>
</template>
