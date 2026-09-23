<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // Its accessible name and its tooltip at once, so an icon button is never left unnamed
  label: string;
  meaning: UiIconMeaning;
  variant?: UiButtonVariant;
}

const { label, meaning, variant } = defineProps<Props>();
</script>

<template>
  <UiButton :aria-label="label" :title="label" :variant px-0>
    <UiIcon :meaning />
  </UiButton>
</template>
