<script setup lang="ts">
import { toMergedFileEdit } from "@/services/agentConsole/toMergedFileEdit";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { fileEdits, fileOriginMap } = storeToRefs(agentConsoleSessionStore);
// Every file the session changed as one diff from where it started, or its edits in the order they ran where the
// Start is not known — a session resumed from its transcript, which keeps no file's text
const fileDiffs = computed(() =>
  Array.from(
    Map.groupBy(fileEdits.value, ({ filePath }) => filePath),
    ([filePath, pathFileEdits]) => {
      const originalText = fileOriginMap.value.get(filePath);
      const mergedFileEdit =
        originalText === undefined ? undefined : toMergedFileEdit(filePath, originalText, pathFileEdits);
      return {
        editCount: pathFileEdits.length,
        fileEdits: mergedFileEdit ? [mergedFileEdit] : pathFileEdits,
        filePath,
      };
    },
  ),
);
</script>

<template>
  <p v-if="fileDiffs.length === 0">No changes yet</p>
  <details v-for="{ editCount, fileEdits: diffFileEdits, filePath } of fileDiffs" v-else :key="filePath" open>
    <summary cursor-pointer truncate>{{ filePath }} · {{ editCount }}</summary>
    <div flex flex-col gap-3>
      <AgentConsolePanelDiff v-for="fileEdit of diffFileEdits" :key="fileEdit.id" :file-edit />
    </div>
  </details>
</template>
