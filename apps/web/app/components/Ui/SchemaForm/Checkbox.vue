<script setup lang="ts">
import type { ControlElement } from "@jsonforms/core";

import { useSchemaFormControl } from "@/composables/ui/useSchemaFormControl";
import { rendererProps } from "@jsonforms/vue";

// JSON Forms hands every renderer the same runtime props its binding reads, so they are declared by its own factory
const props = defineProps(rendererProps<ControlElement>());
const { change, control } = useSchemaFormControl(props);
</script>

<!-- A boolean of a schema form, named by its title -->
<template>
  <UiCheckbox :label="control.label" :model-value="Boolean(control.data)" @update:model-value="change($event)" />
</template>
