<script setup lang="ts">
import { capitalize } from "@esposter/shared";

interface ResourceFileSelectionToolbarProps {
  label: string;
}

defineSlots<{ default?: () => VNode }>();
const { label } = defineProps<ResourceFileSelectionToolbarProps>();
const selectedIds = defineModel<string[]>({ required: true });
const emit = defineEmits<{ delete: [ids: string[]] }>();
const pluralizedLabel = computed(() => `${label}${selectedIds.value.length === 1 ? "" : "s"}`);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title pl-3>{{ selectedIds.length }} {{ pluralizedLabel }} selected</v-toolbar-title>
    <slot />
    <StyledConfirmDeleteDialogButton
      :card-props="{
        title: `Delete ${selectedIds.length} ${capitalize(pluralizedLabel)}`,
        text: `Are you sure you want to delete ${selectedIds.length} selected ${pluralizedLabel}?`,
      }"
      @delete="
        (onComplete) => {
          emit('delete', selectedIds);
          selectedIds = [];
          onComplete();
        }
      "
    />
  </v-toolbar>
</template>
