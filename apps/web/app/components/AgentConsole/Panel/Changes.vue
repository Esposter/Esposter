<script setup lang="ts">
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { fileEdits } = storeToRefs(agentConsoleSessionStore);
// Every file the session changed, each with its edits in the order they ran — the session's diff per file
const fileEditsByPath = computed(() => Map.groupBy(fileEdits.value, ({ filePath }) => filePath));
</script>

<template>
  <p v-if="fileEditsByPath.size === 0">No changes yet</p>
  <details v-for="[filePath, pathFileEdits] of fileEditsByPath" v-else :key="filePath" open>
    <summary cursor-pointer truncate>{{ filePath }} · {{ pathFileEdits.length }}</summary>
    <div flex flex-col gap-3>
      <AgentConsolePanelDiff v-for="fileEdit of pathFileEdits" :key="fileEdit.id" :file-edit />
    </div>
  </details>
</template>
