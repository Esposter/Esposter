<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  createdAt: Date;
  name: string;
  // The key's first characters, which is all of it the server keeps readable, so the owner can match a row to the
  // Key an agent holds
  start: string;
}

const { createdAt, name, start } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
</script>

<template>
  <li ui-row>
    <UiItemContent :description="start ? `${start}…` : undefined" :meaning="UiIconMeaning.Terminal" :title="name">
      <template #append>
        <NuxtTime :datetime="createdAt" text-sm text-muted text-nowrap relative />
        <UiButton @click="emit('delete')">Delete</UiButton>
      </template>
    </UiItemContent>
  </li>
</template>
