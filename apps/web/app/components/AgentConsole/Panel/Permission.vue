<script setup lang="ts">
import type { PermissionRequestEvent } from "agent-console-server/contracts";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
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
  <UiFrame :title="`${permissionRequest.toolName} wants permission`" max-h="[50dvh]">
    <div flex flex-col gap-2 of-y-auto>
      <p v-if="permissionRequest.title || permissionRequest.decisionReason">
        {{ permissionRequest.title }} {{ permissionRequest.decisionReason }}
      </p>
      <p v-if="permissionRequest.blockedPath">Outside the allowed directories: {{ permissionRequest.blockedPath }}</p>
      <template v-if="fileEdits.length > 0">
        <div v-for="fileEdit of fileEdits" :key="fileEdit.id">
          <div>{{ fileEdit.filePath }}</div>
          <AgentConsolePanelDiff :file-edit />
        </div>
      </template>
      <pre v-else ws-pre-wrap of-x-auto>{{ JSON.stringify(permissionRequest.input, null, 2) }}</pre>
    </div>
    <UiTextField v-model="denyMessage" label="Tell Claude what to do instead (on deny)" />
    <div flex flex-wrap gap-2>
      <UiButton :variant="UiButtonVariant.Accent" @click="answer(PermissionBehavior.Allow)">Allow</UiButton>
      <UiButton v-if="permissionRequest.hasSuggestions" @click="answer(PermissionBehavior.AllowAlways)">
        Allow, and don't ask again
      </UiButton>
      <UiButton :variant="UiButtonVariant.Danger" @click="answer(PermissionBehavior.Deny)">Deny</UiButton>
    </div>
  </UiFrame>
</template>
