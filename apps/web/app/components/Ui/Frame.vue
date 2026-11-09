<script setup lang="ts">
interface Props {
  title?: string;
}

// The default slot is the body, which scrolls inside the frame between the title bar and the footer. The footer slot is
// The row pinned under it, drawn only when a call site passes content for it
const slots = defineSlots<{ actions?: () => VNode; default: () => VNode; footer?: () => VNode }>();
const { title = "" } = defineProps<Props>();
</script>

<template>
  <section flex flex-col min-h-0 ui-frame>
    <header v-if="title || slots.actions" px-3 pt-2 flex gap-2 items-center>
      <h2 text-heading-color flex-1 truncate>{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div ui-region-body p-3>
      <slot />
    </div>
    <footer v-if="slots.footer" ui-region-footer>
      <slot name="footer" />
    </footer>
  </section>
</template>
