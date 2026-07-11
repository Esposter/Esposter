<script setup lang="ts">
interface ProsePreProps {
  code?: string;
  language?: string;
}

const { code = "", language } = defineProps<ProsePreProps>();
</script>

<template>
  <DocsMermaid v-if="language === 'mermaid'" :code />
  <pre v-else p-4 rounded overflow-x-auto class="prose-pre"><slot /></pre>
</template>

<style scoped>
.prose-pre {
  background-color: #24292e;
  color: #e1e4e8;
  line-height: 1.5;
}
</style>
