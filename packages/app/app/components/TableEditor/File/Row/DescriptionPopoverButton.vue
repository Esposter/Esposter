<script setup lang="ts">
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { descriptionSchema } from "#shared/models/entity/Description";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface DescriptionPopoverButtonProps {
  row: Row;
}

const { row } = defineProps<DescriptionPopoverButtonProps>();
const updateRow = useUpdateRow();
const isOpen = ref(false);
const editedDescription = ref({ description: row.description });
const jsonSchema = zodToJsonSchema(descriptionSchema);

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) {
    editedDescription.value = { description: row.description };
    return;
  }
  if (editedDescription.value.description === row.description) return;
  updateRow(Object.assign(structuredClone(toRawDeep(row)), { description: editedDescription.value.description }));
});
</script>

<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-tooltip :text="row.description ? 'Edit description' : 'Add description'">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            m-0
            size="small"
            tile
            :icon="row.description ? 'mdi-note' : 'mdi-note-outline'"
            :="{ ...props, ...tooltipProps }"
          />
        </template>
      </v-tooltip>
    </template>
    <Vjsf v-model="editedDescription" :schema="jsonSchema" />
  </v-menu>
</template>
