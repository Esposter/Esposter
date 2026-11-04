<script setup lang="ts" generic="T extends number | string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { UiToggleGroupVariant } from "@/models/ui/UiToggleGroupVariant";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { Radio } from "@vuetify/v0";
import { mergeProps } from "vue";

interface Props {
  isDisabled?: true;
  // Each choice shows its mark alone, its title its accessible name and its tooltip at once, as an icon button's
  // Label is: a rail of emoji categories
  isIconOnly?: true;
  // Stacked down rather than along, which the arrows walk the same way
  isVertical?: true;
  items: UiMenuItem<T>[];
  // The group's accessible name: what its buttons choose between
  label: string;
  // The look a toggle group that heads a view takes. Unset, the group is the segmented control every other one is
  variant?: UiToggleGroupVariant;
}
// One of a few ways to do the same thing, as a segmented control: quiet segments on a field's track, the chosen one
// Filled. A radio group, so it is one stop in the tab order and the arrows move the choice along it. A choice is any
// Value a store keeps, a number as well as a string, and a mark no icon names, such as a clicker's own drawn picture,
// Fills the mark's slot. What a call site passes goes to the group's own element, since the renderless primitive around
// It renders no element of its own to take it
defineOptions({ inheritAttrs: false });
defineSlots<{ mark?: (props: { item: UiMenuItem<T> }) => VNode }>();
const modelValue = defineModel<T>({ required: true });
const { isDisabled, isIconOnly, isVertical, items, label, variant } = defineProps<Props>();
</script>

<template>
  <Radio.Group
    #default="{ attrs }"
    :model-value
    :label
    :disabled="isDisabled"
    mandatory
    renderless
    @update:model-value="
      (value) => {
        if (value !== undefined) modelValue = value;
      }
    "
  >
    <div
      :="mergeProps(attrs, $attrs)"
      :class="[
        isVertical ? 'inline-flex flex-col' : 'inline-flex',
        variant ? 'ui-bar' : 'ui-field',
        { 'op-disabled': isDisabled },
      ]"
    >
      <Radio.Root
        v-for="item of items"
        #default="{ attrs: itemAttrs }"
        :key="item.value"
        :disabled="item.isDisabled"
        :value="item.value"
        renderless
      >
        <UiTooltip #default="{ activatorProps }" :is-disabled="!isIconOnly" :label="item.title">
          <button
            :="isIconOnly ? mergeProps(itemAttrs, activatorProps, { 'aria-label': item.title }) : itemAttrs"
            :class="[{ 'px-0': isIconOnly }, variant ? 'ui-tab' : 'ui-button']"
            :data-variant="variant ?? UiButtonVariant.Quiet"
          >
            <slot name="mark" :item>
              <UiIcon v-if="item.meaning" :meaning="item.meaning" />
              <span v-else-if="item.icon" :class="item.icon" aria-hidden="true" size-6 />
            </slot>
            <template v-if="!isIconOnly">{{ item.title }}</template>
          </button>
        </UiTooltip>
      </Radio.Root>
    </div>
  </Radio.Group>
</template>
