<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  checkIsTabbable: (value: T) => boolean;
  getItemId: (index: number) => string;
  items: UiMenuItem<T>[];
}
// A menu's items, drawn the one way whether a trigger or a point opened the menu around them
defineProps<Props>();
const emit = defineEmits<{ select: [value: T, event: MouseEvent] }>();
// A setting is a checkbox, a choice of a group a radio, and anything else a plain action
const getItemRole = (isChecked: boolean | undefined, isSelected: boolean | undefined) => {
  if (isChecked === undefined) return isSelected === undefined ? "menuitem" : "menuitemradio";

  return "menuitemcheckbox";
};
</script>

<template>
  <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-lifted>
    <!-- @TODO: no upstream issue — vize's virtual code comments a v-for's destructured pattern on its first line only, so a pattern the formatter wraps over several lines breaks the typecheck; destructure the item again once it is fixed -->
    <template v-for="(item, index) of items" :key="item.value">
      <div
        v-if="item.isGroupStart && index > 0"
        role="separator"
        my-1
        bg-divider
        shrink-0
        h="[var(--ui-border-width)]"
      />
      <button
        :id="getItemId(index)"
        :class="{ 'ml-4': item.depth, 'text-error': item.isDanger }"
        class="aria-disabled:op-disabled"
        :aria-checked="item.isChecked ?? item.isSelected"
        :aria-disabled="item.isDisabled || undefined"
        :aria-expanded="item.children ? Boolean(item.isExpanded) : undefined"
        :role="getItemRole(item.isChecked, item.isSelected)"
        :tabindex="checkIsTabbable(item.value) ? 0 : -1"
        type="button"
        ui-item
        @click="emit('select', item.value, $event)"
      >
        <UiItemContent :description="item.description" :icon="item.icon" :meaning="item.meaning" :title="item.title">
          <template v-if="item.children" #append
            ><UiDisclosureIcon :data-state="item.isExpanded ? 'open' : 'closed'" text-muted
          /></template>
          <template v-else-if="item.isChecked || item.isSelected" #append
            ><UiIcon :meaning="UiIconMeaning.Selected" text-accent
          /></template>
        </UiItemContent>
      </button>
    </template>
  </div>
</template>
