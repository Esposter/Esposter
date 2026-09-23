<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { Tabs } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  // The tab list's accessible name: what the tabs choose between
  label: string;
}

const modelValue = defineModel<T>({ required: true });
defineSlots<{ default: (props: { value: T }) => VNode }>();
const { items, label } = defineProps<Props>();
</script>

<template>
  <!-- Mandatory rather than forced: forcing selects the first tab as the tabs register, over the model's own choice -->
  <Tabs.Root
    :model-value
    mandatory
    @update:model-value="
      (value) => {
        if (typeof value === 'string') modelValue = value;
      }
    "
  >
    <Tabs.List :label class="tab-list" flex of-x-auto>
      <Tabs.Item
        v-for="{ title, value } of items"
        :key="value"
        :value
        class="tab"
        px-3
        py-1
        cursor-pointer
        text-muted
        hover:bg="accent/10"
        text-nowrap
      >
        {{ title }}
      </Tabs.Item>
    </Tabs.List>
    <!-- Only the selected panel renders its content: a panel not shown would still mount everything in it -->
    <Tabs.Panel v-for="{ value } of items" #default="{ isSelected }" :key="value" :value pt-4>
      <slot v-if="isSelected" :value />
    </Tabs.Panel>
  </Tabs.Root>
</template>

<style scoped>
/* The list sits on a one-step line in the edge colour, and the selected tab draws its own step of it in the accent */
.tab-list {
  box-shadow: inset 0 calc(var(--ui-step) * -1) 0 0 var(--ui-panel-edge);
}

.tab[data-selected] {
  box-shadow: inset 0 calc(var(--ui-step) * -1) 0 0 var(--ui-accent);
  color: var(--ui-accent);
}
</style>
