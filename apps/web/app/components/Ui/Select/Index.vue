<script setup lang="ts" generic="T extends string, TModel extends T | T[] = T">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsDeepEqual } from "@esposter/shared";
import { Select } from "@vuetify/v0";

interface Props {
  isDisabled?: boolean;
  items: UiMenuItem<T>[];
  label: string;
}
// Bound to an array, it holds several choices: a pick toggles an option and the list stays open while the reader picks
const modelValue = defineModel<TModel>({ required: true });
const { isDisabled, items, label } = defineProps<Props>();
</script>

<!-- A pick of one clears the old choice before it selects the new one, and the model passes on only the choice itself,
  so a call site never sees the select empty in between. Several choices come back as a new array whenever the options
  register, which passes on only once the choices differ -->
<template>
  <Select.Root
    :disabled="isDisabled"
    :model-value
    :multiple="Array.isArray(modelValue)"
    @update:model-value="
      (value) => {
        if ((typeof value === 'string' || Array.isArray(value)) && !checkIsDeepEqual(value, modelValue))
          modelValue = value as TModel;
      }
    "
  >
    <UiSelectActivator :items :label />
    <Select.Content ui-popover>
      <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-lifted>
        <Select.Item
          v-for="{ description, icon, image, meaning, title, value } of items"
          :id="value"
          #default="{ isSelected }"
          :key="value"
          :value
          ui-item
        >
          <UiItemContent :description :icon :image :meaning :title>
            <template #append>
              <UiIcon v-if="isSelected" :meaning="UiIconMeaning.Selected" text-accent />
            </template>
          </UiItemContent>
        </Select.Item>
      </div>
    </Select.Content>
  </Select.Root>
</template>
