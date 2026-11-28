<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { Form } from "@vuetify/v0";

interface Props {
  id?: string | undefined;
  role?: HTMLAttributes["role"];
}

// A form's fields validate as the reader types, so whether it may be submitted is known before the button is pressed:
// Invalid only once a field has said so, since a form nobody has typed in yet has nothing wrong with it. A submit
// Checks every field first and goes through only when all of them pass
defineSlots<{ default: () => VNode }>();
const { id, role } = defineProps<Props>();
const isValid = defineModel<boolean>("isValid", { default: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <Form
    :="{ id, role }"
    @update:model-value="(value) => {
      isValid = value !== false;
    }"
    @submit="(event) => {
      if (event.valid) emit('submit');
    }"
  >
    <slot />
  </Form>
</template>
