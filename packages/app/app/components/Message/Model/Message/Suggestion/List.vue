<script setup lang="ts">
// One surface for all three suggestion popovers — the composer's chrome is the same whether the trigger opened
// Emoji, slash commands or mentions. Only the width differs, and each consumer sets that as a passthrough
// Attribute on this component.
interface SuggestionListProps {
  isVisible: boolean;
  selectedIndex?: number;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { isVisible, selectedIndex, title } = defineProps<SuggestionListProps>();
</script>

<template>
  <StyledCard v-show="isVisible" flex flex-col max-h-64 overflow-y-auto :elevation="1">
    <v-card-title font-bold text-title-small>{{ title }}</v-card-title>
    <StyledList :selected-index :list-props="{ density: 'compact' }" py-0>
      <slot />
    </StyledList>
  </StyledCard>
</template>
