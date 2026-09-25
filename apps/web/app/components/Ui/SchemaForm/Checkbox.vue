<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { useSchemaFormControl } from "@/composables/ui/useSchemaFormControl";

interface Props extends UiSchemaFormRendererProps {}
// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { change, control } = useSchemaFormControl(props);
</script>

<!-- A boolean of a schema form, named by its title -->
<template>
  <UiCheckbox :label="control.label" :model-value="Boolean(control.data)" @update:model-value="change($event)" />
</template>
