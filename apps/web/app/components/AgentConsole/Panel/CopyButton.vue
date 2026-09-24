<script setup lang="ts">
interface Props {
  source: string;
}

const { source } = defineProps<Props>();
const { copied, copy } = useClipboard({ legacy: true });
</script>

<template>
  <AgentConsolePanelButton @click="copy(source)">{{ copied ? "Copied" : "Copy" }}</AgentConsolePanelButton>
</template>
