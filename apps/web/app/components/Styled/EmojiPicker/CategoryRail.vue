<script setup lang="ts">
import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

interface Props {
  categories: EmojiCategory[];
  isHorizontal?: true;
}

const modelValue = defineModel<string>({ required: true });
const { categories, isHorizontal } = defineProps<Props>();
const categoryItems = computed(() =>
  categories.map<UiMenuItem<string>>(({ icon, title }) => ({ icon, title, value: title })),
);
</script>

<template>
  <!-- A rail of icon-only choices, each named by its title, the category shown pressed -->
  <UiToggleGroup
    v-model="modelValue"
    :class="isHorizontal ? 'of-x-auto' : 'of-y-auto'"
    is-icon-only
    :is-vertical="isHorizontal ? undefined : true"
    :items="categoryItems"
    label="Categories"
    shrink-0
  />
</template>
