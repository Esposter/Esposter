<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" size-12 cursor-grab>
    <span class="i-mdi:rectangle-outline" aria-hidden="true" size-10 />
  </UiButton>
</template>
