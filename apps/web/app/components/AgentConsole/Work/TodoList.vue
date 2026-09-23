<script setup lang="ts">
import { TodoStatusIconMap } from "@/services/agentConsole/TodoStatusIconMap";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { TodoStatus } from "agent-console-server/contracts";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { todoUpdate } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <v-list v-if="todoUpdate && todoUpdate.todos.length > 0" density="compact">
    <v-list-subheader>Checklist</v-list-subheader>
    <v-list-item
      v-for="{ activeForm, content, id, status } of todoUpdate.todos"
      :key="id"
      :prepend-icon="TodoStatusIconMap[status]"
      :title="status === TodoStatus.InProgress ? activeForm : content"
    />
  </v-list>
</template>
