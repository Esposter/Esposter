<script setup lang="ts">
import type { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  meaning: UiIconMeaning;
  text: string;
}

defineProps<Props>();
</script>

<template>
  <UiEmptyState :meaning :title="text" flex-1 />
</template>
