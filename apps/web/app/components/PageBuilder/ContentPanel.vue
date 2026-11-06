<script setup lang="ts">
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
// A block whose content is edited on the canvas, as a text block's is, or that has none, as a column has none, holds no field
const hasFields = computed(() => Object.keys(jsonSchema.value?.properties ?? {}).length > 0);
</script>

<template>
  <template v-if="jsonSchema && formValue">
    <UiSchemaForm
      v-if="hasFields"
      :model-value="formValue"
      :schema="jsonSchema"
      :validation-schema
      @update:model-value="(value) => setFormValue(value)"
    />
    <UiEmptyState
      v-else
      description="Edit this block on the canvas, or change how it looks in the Style tab."
      :meaning="UiIconMeaning.Edit"
      title="No content settings"
    />
  </template>
</template>
