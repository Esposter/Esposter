<script setup lang="ts">
interface Props {
  title?: string;
}

const slots = defineSlots<{ actions?: () => VNode; default: () => VNode }>();
const { title = "" } = defineProps<Props>();
</script>

<template>
  <section class="frame" flex flex-col min-h-0>
    <header v-if="title || slots.actions" px-3 pt-2 flex gap-2 items-center>
      <h2 flex-1 truncate>{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div p-3 flex flex-1 flex-col gap-2 min-h-0>
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* A voxel edge: a solid ring one step out on each side, which leaves each corner notched */
.frame {
  background-color: var(--agent-console-panel);
  box-shadow:
    0 -0.25rem 0 0 var(--agent-console-panel-edge),
    0 0.25rem 0 0 var(--agent-console-panel-edge),
    -0.25rem 0 0 0 var(--agent-console-panel-edge),
    0.25rem 0 0 0 var(--agent-console-panel-edge),
    inset 0 0.25rem 0 0 color-mix(in srgb, var(--agent-console-text) 8%, transparent);
}
</style>
