<script setup lang="ts" generic="T extends string">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { useTypeahead } from "@/composables/ui/useTypeahead";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY, SELECT_TRIGGER_TITLE_LIMIT } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";
import { Select, useSelectContext } from "@vuetify/v0";

interface Props {
  items: UiSelectItem<T>[];
  label: string;
}

const { items, label } = defineProps<Props>();
// Inside the select's root, where its context can be read: the primitive walks the options by arrow and by Home and
// End, and typing a title's first letters is added here
const { isOpen, modelValue, popover, virtualFocus } = useSelectContext("v0:select");
const selectedItems = computed(() =>
  items.filter(({ value }) =>
    Array.isArray(modelValue.value) ? modelValue.value.includes(value) : value === modelValue.value,
  ),
);
// The one chosen option as its row shows it; several by their titles, past a few by how many, and the label while
// Nothing is chosen
const selectedItem = computed(() => (selectedItems.value.length === 1 ? selectedItems.value[0] : undefined));
const title = computed(() => {
  if (selectedItems.value.length === 0) return label;
  else if (selectedItems.value.length > SELECT_TRIGGER_TITLE_LIMIT) return `${selectedItems.value.length} selected`;
  else return selectedItems.value.map((item) => item.title).join(", ");
});
const typeahead = useTypeahead();

popover.positionArea.value = POPOVER_POSITION_AREA;
popover.positionTry.value = POPOVER_POSITION_TRY;
</script>

<template>
  <Select.Activator
    :label
    :data-variant="UiButtonVariant.Field"
    ui-button
    justify-start
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
    <UiItemContent :icon="selectedItem?.icon" :image="selectedItem?.image" :meaning="selectedItem?.meaning" :title>
      <template #append>
        <!-- Points down to the list it opens, and turns over while the list is open -->
        <UiIcon :class="{ 'rotate-180': isOpen }" :meaning="UiIconMeaning.Dropdown" />
      </template>
    </UiItemContent>
  </Select.Activator>
</template>
