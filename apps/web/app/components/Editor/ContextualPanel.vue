<script setup lang="ts">
interface Props {
  title: string;
}

defineSlots<{ default: () => VNode }>();
defineProps<Props>();
</script>

<!-- The header names what is selected, so a reader knows what a change will touch. Whether a panel is drawn at all is the editor's: each
     panel draws only while it has a selection to show, and an editor's own settings are a panel its layout keys to the empty selection
     kind -->
<template>
  <aside p-2 flex flex-col gap-3 ui-lifted ui-body :aria-label="title">
    <header flex items-center>
      <h2 flex-1 min-w-0 truncate ui-heading>{{ title }}</h2>
    </header>
    <slot />
  </aside>
</template>
