<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
</script>

<template>
  <v-btn prepend-icon="mdi-floor-plan" variant="text" @click="captureIds = selectedResources.map(({ id }) => id)">
    Save as blueprint
  </v-btn>
</template>
