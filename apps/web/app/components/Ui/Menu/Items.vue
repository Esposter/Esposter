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
  <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-frame>
    <template v-for="({ description, icon, isDanger, isGroupStart, title, value }, index) of items" :key="value">
      <div v-if="isGroupStart && index > 0" role="separator" my-1 bg-panel-edge shrink-0 h-1 />
      <button
        :id="getItemId(index)"
        :class="{ 'text-error': isDanger }"
        role="menuitem"
        :tabindex="isTabbable(value) ? 0 : -1"
        type="button"
        ui-item
        @click="emit('select', value, $event)"
      >
        <span v-if="icon" :class="icon" aria-hidden="true" mr-2 align-middle size-5 inline-block />{{ title }}
        <span v-if="description" text-muted>{{ description }}</span>
      </button>
    </template>
  </div>
</template>
