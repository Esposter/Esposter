<script setup lang="ts">
interface CategoryFieldProps {
  items: { id: null | string; name: string }[];
}

const { items } = defineProps<CategoryFieldProps>();
const modelValue = defineModel<null | string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Category</div>
    <v-select
      v-model="modelValue"
      :items
      density="compact"
      hide-details
      item-title="name"
      item-value="id"
      @update:model-value="emit('save')"
    />
    <span class="text-medium-emphasis" text-xs>Assign this room to a category to group it in the sidebar.</span>
  </div>
</template>
