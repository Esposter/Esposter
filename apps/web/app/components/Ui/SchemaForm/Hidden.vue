<script setup lang="ts">
import type { ControlElement } from "@jsonforms/core";

import { rendererProps } from "@jsonforms/vue";

// A field whose value the schema fixes — a variant's discriminant, which the variant choice sets — has nothing to edit,
// So it draws nothing. JSON Forms still hands it the runtime props its dispatch passes every renderer
defineProps(rendererProps<ControlElement>());
</script>

<template>
  <span hidden />
</template>
