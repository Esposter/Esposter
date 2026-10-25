<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  icon?: UiIconMeaning;
  label?: string;
}
const { icon, label } = defineProps<Props>();
</script>

<template>
  <UiButton w-full aspect-square>
    <span text-center flex flex-col gap-1 h-full items-center justify-center>
      <UiIcon v-if="icon" :meaning="icon" />
      {{ label }}
    </span>
  </UiButton>
</template>
