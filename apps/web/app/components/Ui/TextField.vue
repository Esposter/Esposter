<script setup lang="ts">
import type { FormValidationRule } from "@vuetify/v0";
import type { ValidationRule } from "vuetify";

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
  // A day rather than text, picked from the browser's own calendar in the page's colour scheme, its value reading as
  // YYYY-MM-DD; or a number, stepped by the arrows, its value still the text typed
  type?: "date" | "number";
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

defineExpose({ element });
</script>

<template>
  <Input.Root #default="{ id }" v-model="modelValue" :rules="inputRules" :type validate-on="input" flex flex-col gap-1>
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -- the control is the primitive's, which takes the id this label names -->
    <label :for="String(id)" :class="{ 'sr-only': isLabelHidden }" text-muted>{{ label }}</label>
    <Input.Control #default="{ attrs }" renderless>
      <component
        :is="rows ? 'textarea' : 'input'"
        ref="element"
        v-bind="attrs"
        :autofocus="isAutofocus"
        :placeholder
        :rows
        class="control"
        py-1
        w-full
        resize-y
        ui-sunk
      />
    </Input.Control>
    <div flex gap-2>
      <Input.Error #default="{ errors }" text-error flex-1>{{ errors[0] }}</Input.Error>
      <span v-if="counter" text-muted>{{ modelValue.length }} / {{ counter }}</span>
    </div>
  </Input.Root>
</template>

<style scoped>
/* An invalid field's shade is the error colour, beside the message under it */
.control[aria-invalid="true"] {
  box-shadow: inset 0 calc(var(--ui-step) / -2) 0 0 var(--ui-error);
}
</style>
