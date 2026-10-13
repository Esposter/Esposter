<script setup lang="ts">
import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { toDiffCommentsPrompt } from "@/services/agentConsole/toDiffCommentsPrompt";
import { toMergedFileEdit } from "@/services/agentConsole/toMergedFileEdit";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

const agentConsolePanelStore = useAgentConsolePanelStore();
const { composerText, consolePanelType } = storeToRefs(agentConsolePanelStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, diffCommentMap, fileEdits, fileOriginMap } = storeToRefs(agentConsoleSessionStore);
const { clearDiffComments } = agentConsoleSessionStore;
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
// The file is read by the host from the session's folder and shown in the console, not in this list
const openFile = (path: string) => {
  sendCommand({ path, sessionId: currentSessionId.value, type: CommandType.ReadFile });
};
const diffComments = computed(() => [...diffCommentMap.value.values()]);
// The comments go into the composer as one prompt, appended to any text already there, and the console moves to the
// Conversation, where the composer is, for the person to add to it and send it
const sendDiffComments = () => {
  const prompt = toDiffCommentsPrompt(diffComments.value);
  composerText.value = composerText.value ? `${composerText.value}\n\n${prompt}` : prompt;
  consolePanelType.value = AgentConsolePanelType.Conversation;
  clearDiffComments();
};
// Every file the session changed as one diff from where it started, or its edits in the order they ran where the
// Start is not known — a file too large for the tool to have kept its text from before the first change
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
        isMerged: mergedFileEdit !== undefined,
      };
    },
  ),
);
</script>

<template>
  <div v-if="diffComments.length > 0" flex justify-end>
    <UiButton :variant="UiButtonVariant.Accent" @click="sendDiffComments()">
      Send comments ({{ diffComments.length }})
    </UiButton>
  </div>
  <p v-if="fileDiffs.length === 0">No changes yet</p>
  <details v-for="{ editCount, fileEdits: diffFileEdits, filePath, isMerged } of fileDiffs" v-else :key="filePath" open>
    <summary cursor-pointer truncate>{{ filePath }} · {{ editCount }}</summary>
    <UiButton :variant="UiButtonVariant.Quiet" @click="openFile(filePath)">Open file</UiButton>
    <div flex flex-col gap-3>
      <template v-for="fileEdit of diffFileEdits" :key="fileEdit.id">
        <AgentConsolePanelDiff v-if="isMerged" :file-edit is-commentable />
        <AgentConsolePanelDiff v-else :file-edit />
      </template>
    </div>
  </details>
</template>
