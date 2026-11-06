<script setup lang="ts">
interface Props {
  selectedCount: number;
  title: string;
}

defineSlots<{ default: () => VNode; documentSettings?: () => VNode }>();
const { selectedCount, title } = defineProps<Props>();
</script>

<!-- Its content follows the selection. With nothing selected it shows the document's own settings, when the editor has them, and an
     editor with neither draws no panel. The header names what is selected, so a reader knows what a change will touch -->
<template>
  <aside v-if="selectedCount || $slots.documentSettings" flex flex-col gap-3 p-2 ui-body ui-lifted :aria-label="title">
    <header flex items-center>
      <h2 flex-1 min-w-0 truncate ui-heading>{{ title }}</h2>
    </header>
    <slot v-if="selectedCount" />
    <slot v-else name="documentSettings" />
  </aside>
</template>
