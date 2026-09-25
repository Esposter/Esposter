<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  getItemId: (index: number) => string;
  isTabbable: (value: T) => boolean;
  items: UiMenuItem<T>[];
}

// A menu's items, drawn the one way whether a trigger or a point opened the menu around them
const { getItemId, isTabbable, items } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T, event: MouseEvent] }>();
</script>

<template>
  <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-lifted>
    <template
      v-for="(
        { description, icon, isDanger, isDisabled, isGroupStart, isSelected, meaning, title, value }, index
      ) of items"
      :key="value"
    >
      <div v-if="isGroupStart && index > 0" role="separator" my-1 bg-divider shrink-0 h="[var(--ui-border-width)]" />
      <button
        :id="getItemId(index)"
        :class="{ 'text-error': isDanger }"
        class="aria-disabled:op-disabled"
        :aria-checked="isSelected"
        :aria-disabled="isDisabled || undefined"
        :role="isSelected === undefined ? 'menuitem' : 'menuitemradio'"
        :tabindex="isTabbable(value) ? 0 : -1"
        type="button"
        ui-item
        @click="emit('select', value, $event)"
      >
        <UiItemContent :description :icon :meaning :title>
          <template v-if="isSelected" #append><UiIcon :meaning="UiIconMeaning.Selected" text-accent /></template>
        </UiItemContent>
      </button>
    </template>
  </div>
</template>
