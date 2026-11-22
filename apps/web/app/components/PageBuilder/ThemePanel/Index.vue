<script setup lang="ts">
interface Props {
  resourceId: string;
}
defineProps<Props>();
</script>

<template>
  <div flex flex-col gap-4>
    <PageBuilderThemePanelColors :resource-id />
    <PageBuilderThemePanelFontStacks :resource-id />
  </div>
</template>
