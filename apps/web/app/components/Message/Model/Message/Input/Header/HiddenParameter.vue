<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isHighlighted: boolean;
  name: string;
}

defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <button :data-highlighted="isHighlighted || undefined" type="button" ui-item @click="emit('select')">
    <UiItemContent :description="`Your ${name}`" :meaning="UiIconMeaning.Tag" :title="name" />
  </button>
</template>
