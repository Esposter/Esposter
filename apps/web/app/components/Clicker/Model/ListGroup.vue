<script setup lang="ts">
interface Props {
  count: number;
  icon: string;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { count, icon, title } = defineProps<Props>();
const isOpen = ref(true);
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>
      <span :class="icon" aria-hidden="true" size-6 />
      <span text-heading-color flex-1 truncate>{{ title }}</span>
      <span text-sm text-muted>{{ count }}</span>
    </template>
    <ul flex flex-col>
      <slot />
    </ul>
  </UiCollapsible>
</template>
