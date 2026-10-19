<script setup lang="ts">
import type { StreamDraft } from "@/models/agentConsole/StreamDraft";

interface Props {
  isSideChat?: true;
  streamDraft: StreamDraft;
}

const { isSideChat, streamDraft } = defineProps<Props>();
</script>

<template>
  <!-- Drawn as the whole block will be, so nothing shifts when the pieces are replaced by it -->
  <AgentConsolePanelThinking v-if="streamDraft.isThinking" is-streaming :text="streamDraft.text" />
  <AgentConsoleMarkdown v-else :source="streamDraft.text" :is-side-chat />
</template>
