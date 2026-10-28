<script setup lang="ts">
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import {
  DEFAULT_LENGTH_UNIT,
  STYLE_BORDER_WIDTH_UNITS,
  STYLE_LENGTH_PROPERTIES,
  STYLE_LENGTH_UNITS,
} from "@/services/pageBuilder/constants";
import { getStyleValueError } from "@/services/pageBuilder/getStyleValueError";
import { splitStyleLength } from "@/services/pageBuilder/splitStyleLength";

interface Props {
  label: string;
  // The value the field inherits when it sets none, shown in its place, such as "from Desktop"
  placeholder?: string;
  // The property the value sets, which the browser checks the value against as it is typed
  property: StyleProperty;
}
// The saved value. A draft the check refuses stays in the field, unsaved, and the saved value is left as it was
const modelValue = defineModel<string>({ required: true });
const { label, placeholder, property } = defineProps<Props>();
const draft = ref(modelValue.value);
const rules = [() => getStyleValueError(property, draft.value) ?? true];
// A length is drawn as its number and a unit select, where the number is what the arrows step. A draft that is not a length stays text
const lengthUnits = property === "border-width" ? STYLE_BORDER_WIDTH_UNITS : STYLE_LENGTH_UNITS;
const lengthParts = computed(() =>
  STYLE_LENGTH_PROPERTIES.includes(property) ? splitStyleLength(draft.value, lengthUnits) : undefined,
);
// The unit is held apart from the draft, since an empty number drafts no unit, so clearing a number keeps the one chosen
const unit = ref(splitStyleLength(draft.value, lengthUnits)?.unit || DEFAULT_LENGTH_UNIT);
const unitItems = lengthUnits.map((lengthUnit) => ({ title: lengthUnit, value: lengthUnit }));
// Typing in the text field can empty it into a length, which would swap the field out from under the caret, so the
// Text field holds until focus leaves it
const isEditingText = ref(false);
// An empty number is an empty draft, which saves as no declaration, so clearing a length restores what it inherits
const getDraft = (amount: string, lengthUnit: string) => (amount === "" ? "" : `${amount}${lengthUnit}`);
const setAmount = (amount: string) => {
  draft.value = getDraft(amount, unit.value);
};
const setUnit = (lengthUnit: string) => {
  unit.value = lengthUnit;
  draft.value = getDraft(lengthParts.value?.amount ?? "", lengthUnit);
};
// The arrows step the number and keep its unit, and Shift steps it by ten
const stepAmount = (event: KeyboardEvent) => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  event.preventDefault();
  const step = (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
  const amount = Number(lengthParts.value?.amount) || 0;
  // Rounded, since a decimal amount plus a step can carry float noise, such as 0.14 + 1
  draft.value = getDraft(String(Number((amount + step).toFixed(6))), unit.value);
};

watch(modelValue, (value) => {
  draft.value = value;
});
watch(draft, (value) => {
  const lengthUnit = splitStyleLength(value, lengthUnits)?.unit;
  if (lengthUnit) unit.value = lengthUnit;
  if (getStyleValueError(property, value) === undefined) modelValue.value = value;
});
</script>

<template>
  <div v-if="lengthParts && !isEditingText" flex gap-2 items-end>
    <UiTextField
      :model-value="lengthParts.amount"
      :label
      :placeholder
      :rules
      :type="UiTextFieldType.Number"
      @keydown="(event: KeyboardEvent) => stepAmount(event)"
      @update:model-value="(amount) => setAmount(amount)"
    />
    <UiSelect
      :is-disabled="lengthParts.amount === ''"
      :items="unitItems"
      :label="`${label} unit`"
      :model-value="unit"
      @update:model-value="(lengthUnit) => setUnit(lengthUnit)"
    />
  </div>
  <UiTextField
    v-else
    v-model="draft"
    :label
    :placeholder
    :rules
    @focusin="isEditingText = true"
    @focusout="isEditingText = false"
  />
</template>
