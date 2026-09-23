<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const isFullScreenDialog = defineModel<boolean>({ default: false });
</script>

<template>
  <UiIconButton
    :label="isFullScreenDialog ? 'Exit full screen mode' : 'Enter full screen mode'"
    :meaning="isFullScreenDialog ? UiIconMeaning.Collapse : UiIconMeaning.Expand"
    :variant="UiButtonVariant.Quiet"
    @click="isFullScreenDialog = !isFullScreenDialog"
  />
</template>
