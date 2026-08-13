<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { capitalize } from "@esposter/shared";

interface ResourceSheetSelectionToolbarProps {
  label: string;
}

const { label } = defineProps<ResourceSheetSelectionToolbarProps>();
const selectedIds = defineModel<string[]>({ required: true });
const emit = defineEmits<{ delete: [ids: string[]] }>();
const pluralizedLabel = computed(() => pluralize(label, selectedIds.value.length));
</script>

<template>
  <v-toolbar>
    <v-toolbar-title>{{ selectedIds.length }} {{ pluralizedLabel }} selected</v-toolbar-title>
    <StyledConfirmDeleteDialogButton
      :card-props="{ title: `Delete ${selectedIds.length} ${capitalize(pluralizedLabel)}` }"
      @delete="
        (onComplete) => {
          emit('delete', selectedIds);
          selectedIds = [];
          onComplete();
        }
      "
    >
      Are you sure you want to delete {{ selectedIds.length }} selected {{ pluralizedLabel }}?
    </StyledConfirmDeleteDialogButton>
  </v-toolbar>
</template>
