<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
</script>

<!-- The editor's palette is always beside the canvas, so an empty page says where its first block comes from rather than drawing it again -->
<template>
  <UiEmptyState
    :meaning="UiIconMeaning.Sheet"
    description="Add a block from the palette on the left to start."
    title="This page is empty"
  />
</template>
