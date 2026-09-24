<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" px-0 cursor-grab>
    <span class="i-mdi:rectangle-outline" aria-hidden="true" size-6 />
  </UiButton>
</template>
