<script setup lang="ts">
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  // The kind the resource's document is edited through, which the shell passes beside the resource
  kind: AnyPageBuilderKind;
  resourceId: string;
}
const { kind, resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
const { formSchema, formValue, setFormValue, validationSchema } = usePageBuilderContent(
  kind,
  () => getHeldDocument(resourceId)?.document,
  () => resourceId,
);
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
