<script setup lang="ts" generic="T extends string">
import type { MenuItem } from "@/models/agentConsole/MenuItem";

interface Props {
  items: MenuItem<T>[];
  label: string;
  selectedValue?: T;
}

const { items, label, selectedValue } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T] }>();
// The arrow keys walk the choices, as a listbox's do; Tab leaves it
const focusSibling = (event: KeyboardEvent, isNext: boolean) => {
  if (!(event.target instanceof HTMLElement)) return;
  const item = event.target.closest("li");
  const sibling = isNext ? item?.nextElementSibling : item?.previousElementSibling;
  sibling?.querySelector("button")?.focus();
};
</script>

<template>
  <ul
    :aria-label="label"
    class="menu"
    max-h="[40dvh]"
    py-1
    list-none
    flex
    flex-col
    of-y-auto
    role="listbox"
    tabindex="-1"
    @keydown.down.prevent="focusSibling($event, true)"
    @keydown.up.prevent="focusSibling($event, false)"
  >
    <li v-for="{ description, title, value } of items" :key="value">
      <button
        :aria-selected="value === selectedValue"
        :class="{ selected: value === selectedValue }"
        class="item"
        px-2
        text-left
        w-full
        cursor-pointer
        hover:brightness-125
        role="option"
        type="button"
        @click="emit('select', value)"
      >
        {{ title }} <span v-if="description" class="description">{{ description }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.menu {
  background-color: var(--agent-console-panel);
  box-shadow:
    0 -0.25rem 0 0 var(--agent-console-panel-edge),
    0 0.25rem 0 0 var(--agent-console-panel-edge),
    -0.25rem 0 0 0 var(--agent-console-panel-edge),
    0.25rem 0 0 0 var(--agent-console-panel-edge);
}

.item {
  background-color: transparent;
}

.item:focus-visible,
.selected {
  background-color: color-mix(in srgb, var(--agent-console-accent) 20%, transparent);
}

.description {
  color: var(--agent-console-muted);
}
</style>
