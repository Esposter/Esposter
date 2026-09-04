<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { capitalize } from "@esposter/shared";

interface Props {
  label: string;
}

const { label } = defineProps<Props>();
const selectedIds = defineModel<string[]>({ required: true });
const emit = defineEmits<{ delete: [ids: string[]] }>();
const pluralizedLabel = computed(() => pluralize(label, selectedIds.value.length));
const cardProps = computed(() => ({
  title: `Delete ${selectedIds.value.length} ${capitalize(pluralizedLabel.value)}`,
}));
</script>

<template>
  <v-toolbar>
    <v-toolbar-title>{{ selectedIds.length }} {{ pluralizedLabel }} selected</v-toolbar-title>
    <StyledConfirmDeleteDialogButton
      :card-props
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
