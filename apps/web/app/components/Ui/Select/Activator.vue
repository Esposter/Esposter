<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY, SELECT_TRIGGER_TITLE_LIMIT } from "@/services/ui/constants";
import { Select, useSelectContext } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  label: string;
}

const { items, label } = defineProps<Props>();
// Inside the select's root, where its context can be read: the primitive walks the options by arrow, Home and End, and
// By the first letters typed
const { close, isOpen, modelValue, popover } = useSelectContext("v0:select");
// The trigger is no invoker of the list, so a press on it while the list is open counts as outside it: the browser's
// Light dismiss closes the list on the release, and on touch it does so before the click lands, which the primitive
// Then reads as a press on a closed select and opens it again. A press that began on an open list closes it
const isOpenOnPointerDown = ref(false);
const selectedItems = computed(() =>
  items.filter(({ value }) =>
    Array.isArray(modelValue.value) ? modelValue.value.includes(value) : value === modelValue.value,
  ),
);
// The one chosen option as its row shows it; several by their titles, past a few by how many, and the label while
// Nothing is chosen
const selectedItem = computed(() => (selectedItems.value.length === 1 ? selectedItems.value[0] : undefined));
// A chosen option with no mark leaves the trigger no column for one, so its title starts at the field's edge
const isMarkless = computed(() =>
  selectedItem.value?.icon || selectedItem.value?.image || selectedItem.value?.meaning ? undefined : true,
);
const title = computed(() => {
  if (selectedItems.value.length === 0) return label;
  else if (selectedItems.value.length > SELECT_TRIGGER_TITLE_LIMIT) return `${selectedItems.value.length} selected`;
  else return selectedItems.value.map((item) => item.title).join(", ");
});
popover.positionArea.value = POPOVER_POSITION_AREA;
popover.positionTry.value = POPOVER_POSITION_TRY;
</script>

<template>
  <Select.Activator
    :label
    :data-variant="UiButtonVariant.Field"
    ui-button
    justify-start
    @pointerdown="isOpenOnPointerDown = isOpen"
    @click="
      () => {
        if (isOpenOnPointerDown) close();
        isOpenOnPointerDown = false;
      }
    "
  >
    <UiItemContent
      :icon="selectedItem?.icon"
      :image="selectedItem?.image"
      :is-markless
      :meaning="selectedItem?.meaning"
      :title
    >
      <template #append>
        <!-- Points down to the list it opens, and turns over while the list is open -->
        <UiIcon :class="{ 'rotate-180': isOpen }" :meaning="UiIconMeaning.Dropdown" />
      </template>
    </UiItemContent>
  </Select.Activator>
</template>
