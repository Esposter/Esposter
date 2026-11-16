<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "#src/models/ui/schemaForm/UiSchemaFormRendererProps";

import { unsetRendererState } from "#src/services/ui/schemaForm/unsetRendererState";

interface Props extends UiSchemaFormRendererProps {}
const props = withDefaults(defineProps<Props>(), unsetRendererState);
const { change, control } = useSchemaFormControl(props);
</script>

<!-- A boolean of a schema form, named by its title -->
<template>
  <UiCheckbox :label="control.label" :model-value="Boolean(control.data)" @update:model-value="change($event)" />
</template>
