<script setup lang="ts">
import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

interface Props {
  categories: EmojiCategory[];
}

const modelValue = defineModel<string>({ required: true });
const { categories } = defineProps<Props>();
const categoryItems = computed(() =>
  categories.map<UiMenuItem<string>>(({ icon, title }) => ({ icon, title, value: title })),
);
</script>

<template>
  <!-- A rail of icon-only choices, each named by its title, the category shown pressed -->
  <UiToggleGroup
    v-model="modelValue"
    is-icon-only
    is-vertical
    :items="categoryItems"
    label="Categories"
    shrink-0
    of-y-auto
  />
</template>
