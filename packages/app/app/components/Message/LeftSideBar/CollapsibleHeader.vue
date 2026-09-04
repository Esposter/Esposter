<script setup lang="ts">
interface Props {
  title: string;
}

defineSlots<{ append?: () => VNode }>();
const { title } = defineProps<Props>();
const isCollapsed = defineModel<boolean>("collapsed", { required: true });
</script>

<template>
  <v-list-item font-bold @click="isCollapsed = !isCollapsed">
    {{ title }}
    <template #append>
      <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="small" />
      <slot name="append" />
    </template>
  </v-list-item>
</template>
