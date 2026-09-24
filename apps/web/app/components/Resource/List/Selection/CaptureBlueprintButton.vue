<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="captureIds = selectedResources.map(({ id }) => id)">
    Save as blueprint
  </UiButton>
</template>
