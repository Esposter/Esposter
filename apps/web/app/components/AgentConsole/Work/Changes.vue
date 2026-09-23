<script setup lang="ts">
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { fileEdits } = storeToRefs(agentConsoleSessionStore);
// Every file the session changed, each with its edits in the order they ran — the session's diff per file
const fileEditsByPath = computed(() => Map.groupBy(fileEdits.value, ({ filePath }) => filePath));
</script>

<template>
  <StyledEmptyState v-if="fileEditsByPath.size === 0" icon="mdi-file-compare" title="No changes yet" />
  <v-expansion-panels v-else variant="accordion" multiple>
    <v-expansion-panel v-for="[filePath, pathFileEdits] of fileEditsByPath" :key="filePath">
      <v-expansion-panel-title>
        <span truncate>{{ filePath }}</span>
        <v-chip ml-a size="x-small">{{ pathFileEdits.length }}</v-chip>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div flex flex-col gap-3>
          <AgentConsoleWorkDiff v-for="fileEdit of pathFileEdits" :key="fileEdit.id" :file-edit />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
