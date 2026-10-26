<script setup lang="ts">
interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const { addColor, addFontStack, colors, fonts, setColor, setFontStack } = usePageBuilderTheme(() => resourceId);
</script>

<template>
  <div flex flex-col gap-4>
    <UiColorField
      v-for="color in colors"
      :key="color.name"
      :label="color.name"
      :model-value="color.value"
      @update:model-value="(value) => setColor(color.name, value)"
    />
    <UiButton @click="addColor()">Add a colour</UiButton>
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
