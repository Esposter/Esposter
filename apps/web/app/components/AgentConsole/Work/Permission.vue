<script setup lang="ts">
import type { PermissionRequestEvent } from "agent-console-server/contracts";

import { toFileEdits } from "@/services/agentConsole/toFileEdits";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { CommandType, PermissionBehavior } from "agent-console-server/contracts";

interface Props {
  permissionRequest: PermissionRequestEvent;
}

const { permissionRequest } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId } = storeToRefs(agentConsoleSessionStore);
// What a denial tells Claude to do instead, the terminal's "No, and tell Claude what to do differently"
const denyMessage = ref("");
// A change to a file is shown as the diff it would make; every other input is shown whole
const fileEdits = computed(() =>
  toFileEdits(permissionRequest.toolName, permissionRequest.input, permissionRequest.requestId),
);
const answer = (behavior: PermissionBehavior) => {
  sendCommand({
    behavior,
    message: denyMessage.value,
    requestId: permissionRequest.requestId,
    sessionId: currentSessionId.value,
    type: CommandType.PermissionVerdict,
  });
};
</script>

<template>
  <StyledCard>
    <v-card-title>{{ permissionRequest.toolName }} wants permission</v-card-title>
    <v-card-subtitle v-if="permissionRequest.title || permissionRequest.decisionReason">
      {{ permissionRequest.title }} {{ permissionRequest.decisionReason }}
    </v-card-subtitle>
    <v-card-text flex flex-col gap-2>
      <div v-if="permissionRequest.blockedPath">
        Outside the allowed directories: {{ permissionRequest.blockedPath }}
      </div>
      <template v-if="fileEdits.length > 0">
        <div v-for="fileEdit of fileEdits" :key="fileEdit.id">
          <div font-mono pb-1 text-body-small>{{ fileEdit.filePath }}</div>
          <AgentConsoleWorkDiff :file-edit />
        </div>
      </template>
      <pre v-else ws-pre-wrap of-x-auto>{{ JSON.stringify(permissionRequest.input, null, 2) }}</pre>
      <v-text-field v-model="denyMessage" density="compact" label="Tell Claude what to do instead (on deny)" />
    </v-card-text>
    <v-card-actions>
      <StyledButton :button-props="{ text: 'Allow' }" @click="answer(PermissionBehavior.Allow)" />
      <v-btn
        v-if="permissionRequest.hasSuggestions"
        text="Allow, and don't ask again"
        @click="answer(PermissionBehavior.AllowAlways)"
      />
      <v-btn color="error" text="Deny" @click="answer(PermissionBehavior.Deny)" />
    </v-card-actions>
  </StyledCard>
</template>
