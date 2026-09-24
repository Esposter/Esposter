<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

interface Props {
  items: UiSelectItem<string>[];
}

const { items } = defineProps<Props>();
const modelValue = defineModel<null | string>({ required: true });
const emit = defineEmits<{ save: [] }>();
// A select holds a string, so the room with no category is the empty one
const selectedCategoryId = computed({
  get: () => modelValue.value ?? "",
  set: (newCategoryId) => {
    modelValue.value = newCategoryId || null;
  },
});
</script>

<template>
  <MessageModelRoomSettingsField hint="Assign this room to a category to group it in the sidebar." title="Category">
    <UiSelect v-model="selectedCategoryId" :items label="Category" @update:model-value="emit('save')" />
  </MessageModelRoomSettingsField>
</template>
