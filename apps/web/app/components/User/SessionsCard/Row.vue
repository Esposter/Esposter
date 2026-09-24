<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  deviceLabel: string;
  isCurrent?: true;
  updatedAt: Date;
}

const { deviceLabel, isCurrent, updatedAt } = defineProps<Props>();
const emit = defineEmits<{ revoke: [] }>();
</script>

<template>
  <li ui-row>
    <UiItemContent
      :description="isCurrent ? 'This device' : undefined"
      :meaning="UiIconMeaning.Device"
      :title="deviceLabel"
    >
      <template #append>
        <NuxtTime :datetime="updatedAt" text-sm text-muted text-nowrap relative />
        <!-- The current row signs this browser out rather than revoking a session the reader is still using, so the
             wording says which one it is before the click rather than after -->
        <UiButton @click="emit('revoke')">{{ isCurrent ? "Sign out" : "Revoke" }}</UiButton>
      </template>
    </UiItemContent>
  </li>
</template>
