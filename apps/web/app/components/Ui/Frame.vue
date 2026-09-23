<script setup lang="ts">
interface Props {
  title?: string;
}

const slots = defineSlots<{ actions?: () => VNode; default: () => VNode }>();
const { title = "" } = defineProps<Props>();
</script>

<template>
  <section flex flex-col min-h-0 ui-frame>
    <header v-if="title || slots.actions" px-3 pt-2 flex gap-2 items-center>
      <h2 text-accent flex-1 truncate>{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div p-3 flex flex-1 flex-col gap-2 min-h-0>
      <slot />
    </div>
  </section>
</template>
