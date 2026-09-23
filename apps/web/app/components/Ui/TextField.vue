<script setup lang="ts">
import type { FormValidationRule } from "@vuetify/v0";
import type { ValidationRule } from "vuetify";

import { Input } from "@vuetify/v0";

interface Props {
  label: string;
  // Lines of a field that takes several, which the reader can drag taller; a field of one line without it
  rows?: number;
  // Checked as the reader types, each a message or true; a form around the field counts its result
  rules?: ValidationRule[];
}

const modelValue = defineModel<string>({ required: true });
const { label, rows, rules = [] } = defineProps<Props>();
// Vuetify's rules own validation until retirement, and one may be a bare result or a promise-like rather than a
// Function returning a promise, which is all the primitive takes
const inputRules = computed<FormValidationRule[]>(() =>
  rules.map((rule) => async (value) => (typeof rule === "function" ? rule(value) : rule)),
);
</script>

<template>
  <Input.Root v-model="modelValue" #default="{ id }" :rules="inputRules" validate-on="input" flex flex-col gap-1>
    <label :for="String(id)" text-muted>{{ label }}</label>
    <Input.Control :as="rows ? 'textarea' : 'input'" :rows class="control" py-1 w-full resize-y ui-sunk />
    <Input.Error #default="{ errors }" text-error>{{ errors[0] }}</Input.Error>
  </Input.Root>
</template>

<style scoped>
/* An invalid field's shade is the error colour, beside the message under it */
.control[aria-invalid="true"] {
  box-shadow: inset 0 calc(var(--ui-step) / -2) 0 0 var(--ui-error);
}
</style>
