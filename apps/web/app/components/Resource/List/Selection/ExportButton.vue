<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const { exportResourcesCsv } = useExportResourcesCsv();
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="exportResourcesCsv(selectedResources)">Export CSV</UiButton>
</template>
