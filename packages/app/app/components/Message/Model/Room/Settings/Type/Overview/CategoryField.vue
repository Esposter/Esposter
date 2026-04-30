<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

interface CategoryFieldProps {
  items: SelectItemCategoryDefinition<null | string>[];
}

const { items } = defineProps<CategoryFieldProps>();
const modelValue = defineModel<null | string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Category</div>
    <v-select v-model="modelValue" :items density="compact" hide-details @update:model-value="emit('save')" />
    <span class="text-medium-emphasis" text-xs>Assign this room to a category to group it in the sidebar.</span>
  </div>
</template>
