<script setup lang="ts" generic="T extends string">
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  id: string;
  // Whether the row is selected, in a list that holds a selection, which makes it an option; absent in any other
  isSelected?: boolean;
  isTabbable: boolean;
  item: UiListItem<T>;
  // Anything the row's own element takes beside what the list gives it, such as the props that open its context menu
  rowProps?: Record<string, unknown>;
}

// One row of a list, drawn the one way whichever the list is: an option of a listbox, marked at its end while selected,
// Or a list item holding a link or a button, with the row's actions beside it
defineSlots<{ actions?: () => VNode; append?: () => VNode; mark?: () => VNode; title?: () => VNode }>();
const { id, isSelected, isTabbable, item, rowProps } = defineProps<Props>();
const emit = defineEmits<{ focus: []; select: [event: KeyboardEvent | MouseEvent] }>();
const NuxtInvisibleLink = resolveComponent("NuxtInvisibleLink");
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- the list's roving focus sets the option's tabindex -->
  <div
    v-if="isSelected !== undefined"
    v-bind="rowProps"
    :id
    :class="{ 'text-error': item.isDanger }"
    :aria-selected="isSelected"
    role="option"
    :tabindex="isTabbable ? 0 : -1"
    ui-item
    @click="emit('select', $event)"
    @focus="emit('focus')"
  >
    <UiItemContent
      :description="item.description"
      :icon="item.icon"
      :image="item.image"
      :meaning="item.meaning"
      :title="item.title"
    >
      <template v-if="$slots.mark" #mark><slot name="mark" /></template>
      <template v-if="$slots.title" #title><slot name="title" /></template>
      <template #append>
        <slot name="append" />
        <UiIcon v-if="isSelected" :meaning="UiIconMeaning.Selected" text-accent />
      </template>
    </UiItemContent>
  </div>
  <div v-else role="listitem" flex items-center>
    <component
      :is="item.to ? NuxtInvisibleLink : 'button'"
      v-bind="{ ...rowProps, ...(item.to ? { to: item.to } : { type: 'button' }) }"
      :id
      :class="{ 'text-error': item.isDanger }"
      :aria-current="item.isCurrent ? (item.to ? 'page' : 'true') : undefined"
      :tabindex="isTabbable ? 0 : -1"
      ui-item
      flex-1
      min-w-0
      @click="emit('select', $event)"
      @focus="emit('focus')"
    >
      <UiItemContent
        :description="item.description"
        :icon="item.icon"
        :image="item.image"
        :meaning="item.meaning"
        :title="item.title"
      >
        <template v-if="$slots.mark" #mark><slot name="mark" /></template>
        <template v-if="$slots.title" #title><slot name="title" /></template>
        <template v-if="$slots.append" #append><slot name="append" /></template>
      </UiItemContent>
    </component>
    <slot name="actions" />
  </div>
</template>
