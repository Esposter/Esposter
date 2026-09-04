<script setup lang="ts">
interface Props {
  deviceLabel: string;
  isCurrent?: true;
  updatedAt: Date;
}

const { deviceLabel, isCurrent, updatedAt } = defineProps<Props>();
const emit = defineEmits<{ revoke: [] }>();
</script>

<template>
  <v-list-item px-4>
    <template #prepend>
      <v-icon :icon="isCurrent ? 'mdi-monitor-shimmer' : 'mdi-monitor'" mr-4 size="large" />
    </template>
    <!-- A list row ellipses its title and clamps its subtitle to one line, which is right for a name standing
         in for a thing the reader already knows and wrong here: the browser, the platform and how recently it
         was used are the whole basis for deciding whether this row is someone else. On a narrow screen that is
         exactly the text an ellipsis eats, so both wrap instead -->
    <v-list-item-title ws-normal>{{ deviceLabel }}</v-list-item-title>
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

<style scoped lang="scss">
:deep(.v-list-item-subtitle) {
  line-clamp: unset;
  -webkit-line-clamp: unset;
}
</style>
