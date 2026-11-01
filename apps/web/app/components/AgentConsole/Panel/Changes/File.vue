<script setup lang="ts">
import type { FileEdit } from "@/models/agentConsole/FileEdit";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType } from "agent-console-server/contracts";

interface Props {
  editCount: number;
  fileEdits: FileEdit[];
  filePath: string;
  isMerged: boolean;
}

const { editCount, fileEdits, filePath, isMerged } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <!-- The file is read by the host from the session's folder and shown in the console, not in this list -->
  <details open>
    <summary cursor-pointer truncate>{{ filePath }} · {{ editCount }}</summary>
    <UiButton
      :variant="UiButtonVariant.Quiet"
      @click="sendCommand({ path: filePath, sessionId: currentSessionId, type: CommandType.ReadFile })"
    >
      Open file
    </UiButton>
    <div flex flex-col gap-3>
      <template v-for="fileEdit of fileEdits" :key="fileEdit.id">
        <AgentConsolePanelDiff v-if="isMerged" :file-edit is-commentable />
        <AgentConsolePanelDiff v-else :file-edit />
      </template>
    </div>
  </details>
</template>
