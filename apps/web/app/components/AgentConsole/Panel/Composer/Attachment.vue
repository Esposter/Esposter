<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  name: string;
}

const { name } = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <UiButton :aria-label="`Remove ${name}`" @click="emit('remove')">
    {{ name }}
    <UiIcon :meaning="UiIconMeaning.Remove" />
  </UiButton>
</template>
