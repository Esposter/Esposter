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
    <template
      v-for="(
        {
          children,
          depth,
          description,
          icon,
          isChecked,
          isDanger,
          isDisabled,
          isExpanded,
          isGroupStart,
          isSelected,
          meaning,
          title,
          value,
        },
        index
      ) of items"
      :key="value"
    >
      <div v-if="isGroupStart && index > 0" role="separator" my-1 bg-divider shrink-0 h="[var(--ui-border-width)]" />
      <button
        :id="getItemId(index)"
        :class="{ 'ml-4': depth, 'text-error': isDanger }"
        class="aria-disabled:op-disabled"
        :aria-checked="isChecked ?? isSelected"
        :aria-disabled="isDisabled || undefined"
        :aria-expanded="children ? Boolean(isExpanded) : undefined"
        :role="getItemRole(isChecked, isSelected)"
        :tabindex="checkIsTabbable(value) ? 0 : -1"
        type="button"
        ui-item
        @click="emit('select', value, $event)"
      >
        <UiItemContent :description :icon :meaning :title>
          <template v-if="children" #append
            ><UiDisclosureIcon :data-state="isExpanded ? 'open' : 'closed'" text-muted
          /></template>
          <template v-else-if="isChecked || isSelected" #append
            ><UiIcon :meaning="UiIconMeaning.Selected" text-accent
          /></template>
        </UiItemContent>
      </button>
    </template>
  </div>
</template>
