<script setup lang="ts">
interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const { addFontStack, fonts, setFontStack } = usePageBuilderTheme(() => resourceId);
</script>

<template>
  <div flex flex-col gap-4>
    <!-- A font stack is checked as a font-family value, the same check a node's font family takes -->
    <PageBuilderStylePanelField
      v-for="font in fonts"
      :key="font.name"
      :label="font.name"
      :model-value="font.value"
      property="font-family"
      @update:model-value="(value) => setFontStack(font.name, value)"
    />
    <UiButton @click="addFontStack()">Add a font stack</UiButton>
  </div>
</template>
