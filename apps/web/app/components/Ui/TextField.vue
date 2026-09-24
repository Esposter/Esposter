<script setup lang="ts">
import type { FormValidationRule } from "@vuetify/v0";
import type { ValidationRule } from "vuetify";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { Input } from "@vuetify/v0";

interface Props {
  // The most characters it takes, counted under it as the reader types
  counter?: number;
  isAutofocus?: true;
  // Named for assistive technology alone, where what surrounds the field already says what it is for: a column's
  // Filter under the column's name, a cell being edited in its row
  isLabelHidden?: true;
  label: string;
  // A hint inside a field whose label is hidden, never a label of its own: "Filter", "Minimum"
  placeholder?: string;
  // Lines of a field that takes several, which the reader can drag taller; a field of one line without it
  rows?: number;
  // Checked as the reader types, each a message or true; a form around the field counts its result
  rules?: ValidationRule[];
  type?: UiTextFieldType;
}

const modelValue = defineModel<string>({ required: true });
const { counter, isAutofocus, isLabelHidden, label, placeholder, rows, rules = [], type } = defineProps<Props>();
// Vuetify's rules own validation until retirement, and one may be a bare result or a promise-like rather than a
// Function returning a promise, which is all the primitive takes
const inputRules = computed<FormValidationRule[]>(() =>
  rules.map((rule) => async (value) => await (typeof rule === "function" ? rule(value) : rule)),
);
// The control is ours to render rather than the primitive's, so what completes the field or anchors to it reads the
// Element here
const element = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>("element");
// A search says what it searches inside itself, so its label is the hint and stays its accessible name
const isSearch = computed(() => type === UiTextFieldType.Search);

defineExpose({ element });
</script>

<template>
  <Input.Root
    #default="{ errors, id }"
    v-model="modelValue"
    :rules="inputRules"
    :type
    validate-on="input"
    flex
    flex-col
    gap-1
  >
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -- the control is the primitive's, which takes the id this label names -->
    <label :for="String(id)" :class="{ 'sr-only': isLabelHidden || isSearch }" text-sm text-muted>{{ label }}</label>
    <div relative>
      <UiIcon
        v-if="isSearch"
        :meaning="UiIconMeaning.Search"
        text-muted
        pointer-events-none
        left-2
        top="1/2"
        absolute
        translate-y="-1/2"
      />
      <Input.Control #default="{ attrs }" renderless>
        <component
          :is="rows ? 'textarea' : 'input'"
          ref="element"
          v-bind="attrs"
          :autofocus="isAutofocus"
          :class="{ 'ui-pill pl-10 pr-10': isSearch }"
          :placeholder="placeholder ?? (isSearch ? label : undefined)"
          :rows
          class="control"
          px-2
          py-1
          min-h-8
          w-full
          resize-y
          ui-sunk
        />
      </Input.Control>
      <UiIconButton
        v-if="isSearch && modelValue"
        label="Clear search"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        right-0
        top-0
        absolute
        ui-pill
        @click="modelValue = ''"
      />
    </div>
    <!-- Only while it has something to say, so a field in a row lines up with the buttons beside it -->
    <div v-if="errors.length > 0 || counter" flex gap-2>
      <Input.Error #default="{ errors }" text-error flex-1>{{ errors[0] }}</Input.Error>
      <span v-if="counter" text-muted>{{ modelValue.length }} / {{ counter }}</span>
    </div>
  </Input.Root>
</template>

<style scoped>
/* An invalid field is marked as a focused one is, in the error colour, beside the message under it */
.control[aria-invalid="true"] {
  box-shadow: inset 0 calc(var(--ui-indicator-width) * -1) 0 0 var(--ui-error);
}

/* The library draws its own clear button */
.control::-webkit-search-cancel-button {
  appearance: none;
}
</style>
