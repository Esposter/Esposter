<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

interface OverviewCategoryFieldProps {
  items: SelectItemCategoryDefinition<null | string>[];
}

const { items } = defineProps<OverviewCategoryFieldProps>();
const modelValue = defineModel<null | string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField hint="Assign this room to a category to group it in the sidebar." title="Category">
    <v-select v-model="modelValue" :items density="compact" @update:model-value="emit('save')" />
  </MessageModelRoomSettingsField>
</template>
