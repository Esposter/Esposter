<script setup lang="ts">
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { status } = storeToRefs(agentConsoleConnectionStore);
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { currentSessionId, pendingPermissionRequests } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <AgentConsolePairing v-if="status === ConnectionStatus.Unpaired" />
  <div v-else flex flex-col h-full>
    <v-alert v-if="status === ConnectionStatus.Disconnected" type="warning" density="compact">
      The host is not answering. Reconnecting — start it again and the page picks up where it was.
    </v-alert>
    <StyledEmptyState
      v-if="!currentSessionId"
      description="Pick a session on the left to resume it, or start a new one in a repository."
      icon="mdi-console"
      title="No session open"
    />
    <template v-else>
      <AgentConsoleWorkHeader />
      <AgentConsoleWorkConversation flex-1 min-h-0 />
      <div v-if="pendingPermissionRequests.length > 0" p-2 flex flex-col gap-2>
        <AgentConsoleWorkPermission
          v-for="permissionRequest of pendingPermissionRequests"
          :key="permissionRequest.requestId"
          :permission-request
        />
      </div>
    </template>
  </div>
</template>
