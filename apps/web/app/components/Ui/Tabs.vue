<script setup lang="ts" generic="T extends string">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { Tabs } from "@vuetify/v0";

interface Props {
  // Fills the height its parent gives it — a sheet, a dialog, a pane of a set size — rather than growing with its
  // Content: the tab list keeps its row and the selected panel takes the rest, scrolling whatever does not fit, so a
  // Short parent never pushes the content out past its edge
  isFilling?: true;
  items: UiTabItem<T>[];
  // The tab list's accessible name: what the tabs choose between
  label: string;
}

defineSlots<{ default: (props: { value: T }) => VNode }>();
const modelValue = defineModel<T>({ required: true });
const { isFilling, items, label } = defineProps<Props>();
</script>

<template>
  <!-- Laid out by the parent as the list and the panel side by side unless it fills a height, when the two are its
    Own rows. Mandatory rather than forced: forcing selects the first tab as the tabs register, over the model's
    Own choice -->
  <div :class="isFilling ? 'grid rows-[auto_1fr] min-h-0' : 'contents'">
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
        <Tabs.Item
          v-for="{ count, icon, meaning, title, value } of items"
          :key="value"
          :value
          ui-tab
          flex
          gap-2
          items-center
        >
          <UiIcon v-if="meaning" :meaning />
          <span v-else-if="icon" :class="icon" aria-hidden="true" size-6 />
          {{ title }}
          <!-- A reading rather than a chip, muted whether or not its tab is the selected one -->
          <span v-if="count !== undefined" text-muted>{{ count }}</span>
        </Tabs.Item>
      </Tabs.List>
      <!-- Only the selected panel renders its content: a panel not shown would still mount everything in it. A panel
      May shrink below its content either way, so a grid or flex parent that gives it a size lets what it holds scroll
      Rather than a long line widening the panel past its parent -->
      <Tabs.Panel
        v-for="{ value } of items"
        #default="{ isSelected }"
        :key="value"
        :value
        :class="{ 'of-y-auto': isFilling }"
        pt-4
        min-h-0
        min-w-0
      >
        <slot v-if="isSelected" :value />
      </Tabs.Panel>
    </Tabs.Root>
  </div>
</template>
