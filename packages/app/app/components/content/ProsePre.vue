<script setup lang="ts">
interface ProsePreProps {
  code?: string;
  language?: string;
}

const { code = "", language } = defineProps<ProsePreProps>();
const { copied, copy } = useClipboard({ source: code });
</script>

<template>
  <DocsMermaid v-if="language === 'mermaid'" :code />
  <div v-else class="prose-pre group" my-4 rd-lg relative overflow-hidden>
    <v-btn
      op-0
      transition-opacity
      duration-[--transition-duration]
      right-2
      top-2
      absolute
      focus:op-100
      group-hover:op-100
      color="grey-lighten-1"
      density="comfortable"
      :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
      size="small"
      variant="text"
      @click="copy()"
    />
    <pre m-0 p-4 overflow-x-auto><slot /></pre>
  </div>
</template>

<style scoped>
.prose-pre {
  background-color: #24292e;
  color: #e1e4e8;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
