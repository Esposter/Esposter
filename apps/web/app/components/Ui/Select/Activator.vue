<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { useTypeahead } from "@/composables/ui/useTypeahead";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";
import { Select, useSelectContext } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  label: string;
}

const { items, label } = defineProps<Props>();
// Inside the select's root, where its context can be read: the primitive walks the options by arrow and by Home and
// End, and typing a title's first letters is added here
const { isOpen, modelValue, popover, virtualFocus } = useSelectContext("v0:select");
const selectedTitle = computed(() => items.find(({ value }) => value === modelValue.value)?.title ?? label);
const typeahead = useTypeahead();

popover.positionArea.value = POPOVER_POSITION_AREA;
popover.positionTry.value = POPOVER_POSITION_TRY;
</script>

<template>
  <Select.Activator
    :label
    px-2
    min-h-8
    flex
    gap-2
    items-center
    shrink-0
    cursor-pointer
    ui-raised
    hover:brightness-125
    @keydown="
      (event: KeyboardEvent) => {
        if (!isOpen) return;
        const index = typeahead(
          event,
          items.map(({ title }) => title),
          items.findIndex(({ value }) => value === virtualFocus.highlightedId.value),
        );
        if (index !== undefined) virtualFocus.highlight(takeOne(items, index).value);
      }
    "
  >
    {{ selectedTitle }}
    <!-- Points down to the list it opens, and turns over while the list is open -->
    <UiIcon :class="{ 'rotate-180': isOpen }" :meaning="UiIconMeaning.Dropdown" />
  </Select.Activator>
</template>
