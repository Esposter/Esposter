<script setup lang="ts">
export interface UserSessionsCardRowProps {
  deviceLabel: string;
  isCurrent?: true;
  updatedAt: Date;
}

const { deviceLabel, isCurrent, updatedAt } = defineProps<UserSessionsCardRowProps>();
const emit = defineEmits<{ revoke: [] }>();
</script>

<template>
  <v-list-item px-4>
    <template #prepend>
      <v-icon :icon="isCurrent ? 'mdi-monitor-shimmer' : 'mdi-monitor'" mr-4 size="large" />
    </template>
    <v-list-item-title>{{ deviceLabel }}</v-list-item-title>
    <v-list-item-subtitle>
      <template v-if="isCurrent">This device · </template>
      last active <NuxtTime :datetime="updatedAt" relative />
    </v-list-item-subtitle>
    <template #append>
      <!-- The current row signs this browser out rather than revoking a session the reader is still using, so
           the wording says which one it is before the click rather than after -->
      <v-btn color="error" :text="isCurrent ? 'Sign out' : 'Revoke'" @click="emit('revoke')" />
    </template>
  </v-list-item>
</template>
