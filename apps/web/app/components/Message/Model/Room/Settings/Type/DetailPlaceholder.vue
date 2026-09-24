<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  meaning: UiIconMeaning;
  text: string;
}

const { meaning, text } = defineProps<Props>();
</script>

<template>
  <UiEmptyState :meaning :title="text" flex-1 />
</template>
