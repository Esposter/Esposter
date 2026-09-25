<script setup lang="ts">
import { Form } from "@vuetify/v0";

// A form's fields validate as the reader types, so whether it may be submitted is known before the button is pressed:
// Invalid only once a field has said so, since a form nobody has typed in yet has nothing wrong with it. A submit
// Checks every field first and goes through only when all of them pass
defineSlots<{ default: () => VNode }>();
const isValid = defineModel<boolean>("isValid", { default: true });
const emit = defineEmits<{ submit: [] }>();
</script>

<template>
  <Form
    @update:model-value="
      (value) => {
        isValid = value !== false;
      }
    "
    @submit="
      ({ valid }) => {
        if (valid) emit('submit');
      }
    "
  >
    <slot />
  </Form>
</template>
