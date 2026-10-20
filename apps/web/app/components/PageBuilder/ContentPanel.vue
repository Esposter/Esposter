<script setup lang="ts">
import { usePageBuilderContent } from "@/composables/pageBuilder/usePageBuilderContent";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const { formSchema, formValue, setFormValue, validationSchema } = usePageBuilderContent(() => resourceId);
// Nothing is drawn for a resource whose document is not held, since there is no node or root to edit
const jsonSchema = computed(() => formSchema.value && zodToJsonSchema(formSchema.value));
</script>

<template>
  <UiSchemaForm
    v-if="jsonSchema && formValue"
    :model-value="formValue"
    :schema="jsonSchema"
    :validation-schema
    @update:model-value="(value) => setFormValue(value)"
  />
</template>
