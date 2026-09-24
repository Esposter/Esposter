<script setup lang="ts">
// One surface for all three suggestion lists — the composer's chrome is the same whether the trigger opened emoji, slash
// Commands or mentions. Only the width differs, and each consumer sets that as a passthrough attribute on this component
interface Props {
  isVisible: boolean;
  selectedIndex?: number;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { isVisible, selectedIndex, title } = defineProps<Props>();
const listbox = useTemplateRef("listbox");

watch(
  () => selectedIndex,
  (newSelectedIndex) => {
    if (newSelectedIndex === undefined) return;
    listbox.value?.children[newSelectedIndex]?.scrollIntoView({ block: "nearest" });
  },
  { flush: "post" },
);
</script>

<!-- Drawn by the editor in a caret popover inside its own tree, and walked by the keys the suggestion plugin hands it
     while focus stays in the editor -->
<template>
  <div v-show="isVisible" py-1 flex flex-col max-h-64 ui-lifted ui-body>
    <span aria-hidden="true" text-sm text-muted px-3 py-1>{{ title }}</span>
    <div ref="listbox" :aria-label="title" role="listbox" flex flex-col of-y-auto>
      <slot />
    </div>
  </div>
</template>
