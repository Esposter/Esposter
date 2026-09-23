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
    <Tabs.List :label ui-tab-list>
      <Tabs.Item v-for="{ title, value } of items" :key="value" :value ui-tab>
        {{ title }}
      </Tabs.Item>
    </Tabs.List>
    <!-- Only the selected panel renders its content: a panel not shown would still mount everything in it. A panel may
      Shrink below its content, so a grid or flex parent that gives it a height lets what it holds scroll -->
    <Tabs.Panel v-for="{ value } of items" #default="{ isSelected }" :key="value" :value pt-4 min-h-0>
      <slot v-if="isSelected" :value />
    </Tabs.Panel>
  </Tabs.Root>
</template>
