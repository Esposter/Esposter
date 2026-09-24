<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

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
      v-for="({ description, icon, isDanger, isDisabled, isGroupStart, meaning, title, value }, index) of items"
      :key="value"
    >
      <div v-if="isGroupStart && index > 0" role="separator" my-1 bg-divider shrink-0 h="[var(--ui-border-width)]" />
      <button
        :id="getItemId(index)"
        :class="{ 'text-error': isDanger }"
        class="aria-disabled:op-disabled"
        :aria-disabled="isDisabled || undefined"
        role="menuitem"
        :tabindex="isTabbable(value) ? 0 : -1"
        type="button"
        ui-item
        @click="emit('select', value, $event)"
      >
        <UiIcon v-if="meaning" :meaning mr-2 />
        <span v-else-if="icon" :class="icon" aria-hidden="true" mr-2 align-middle size-5 inline-block />{{ title }}
        <span v-if="description" text-muted>{{ description }}</span>
      </button>
    </template>
  </div>
</template>
