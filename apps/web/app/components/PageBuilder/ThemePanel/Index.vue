<script setup lang="ts">
import { usePageBuilderTheme } from "@/composables/pageBuilder/usePageBuilderTheme";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const { addColor, colors, setColor } = usePageBuilderTheme(() => resourceId);
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
  </div>
</template>
